import { Body, Controller, Get, Post, Query, Req, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../user/dto/user-create.dto";
import { LoginUserDto } from "../user/dto/user-login.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth-guard";
import { RefreshTokenDto } from "./dto/refresh-token.dto";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('login')
    async login(@Body() req: LoginUserDto) {
        console.log("Request on login", req)
        return this.authService.login(req)
    }

    @Post('register')
    async register(@Body() userData: CreateUserDto) {
        console.log('UserData', userData);
        return this.authService.register(userData);
    }

    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    @Post('logout')
    async logout(@Body() token: string) {
        try {
            await this.authService.logout(token);
            return { message: 'Logout successful' };
        } catch (error) {
            throw new UnauthorizedException('Logout failed');
        }
    }
}