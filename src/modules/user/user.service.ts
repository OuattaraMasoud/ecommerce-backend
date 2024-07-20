import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/user-create.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) { }

    async getCurrentUser(userEmail: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: userEmail },
            });

            if (!user) {
                throw new NotFoundException(`User with email ${userEmail} not found`);
            }

            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }
    }

    async createUser(user: CreateUserDto): Promise<string> {
        try {
            await this.prisma.user.create({ data: user });
            return "User created successfully";
        } catch (error) {
            throw error;
        }
    }

    async findUser(email: string): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    async updateUser(userId: string, data: any): Promise<string> {
        const updateData = Object.keys(data).reduce((acc, key) => {
            if (data[key] !== undefined) {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
            return 'Profile updated successfully';
        } catch (error) {

            console.error("Error updating user:", error);
            throw error;
        }
    }

    async removeUser(id: string): Promise<string> {
        try {
            await this.prisma.user.delete({ where: { id } });
            return 'User deleted successfully';
        } catch (error) {

            console.error("Error deleting user:", error);
            throw error;
        }
    }
}
