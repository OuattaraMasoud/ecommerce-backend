import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from '../user/dto/user-create.dto';
import { User } from '../user/interface/user.interface';
import { LoginUserDto } from '../user/dto/user-login.dto';

@Injectable()
export class AuthService {
    private readonly invalidatedTokens: string[] = [];

    logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(userData: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
        });
        return user;
    }

    async login(user: LoginUserDto) {
        if (!user.email || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const validatedUser = await this.validateUser(user.email, user.password);
        if (!validatedUser) {
            throw new UnauthorizedException('Invalid user or credentials');
        }

        delete validatedUser.password;
        const refreshToken = this.jwtService.sign({ sub: validatedUser.id }, { expiresIn: '7d' });

        const accessToken = this.jwtService.sign({ sub: validatedUser.id });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refreshToken(refreshToken: string) {
        // Verify the refresh token
        const user = await this.verifyRefreshToken(refreshToken);

        // Generate a new access token
        const accessToken = this.jwtService.sign({ sub: user.id });

        return {
            access_token: accessToken,
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }

        return null;
    }

    async verifyRefreshToken(refreshToken: string): Promise<User> {
        // Verify and decode the refresh token
        const decodedToken = this.jwtService.decode(refreshToken);

        // Check if the token is valid and not invalidated
        if (!decodedToken || this.isTokenInvalidated(refreshToken)) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Fetch the user based on the decoded token
        const user = await this.prisma.user.findUnique({
            where: {
                id: decodedToken.sub,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    isTokenInvalidated(token: string): boolean {
        return this.invalidatedTokens.includes(token);
    }

    async invalidateToken(token: string): Promise<void> {
        this.invalidatedTokens.push(token);
    }

    async logout(token: string): Promise<void> {
        this.invalidateToken(token);
    }
}
