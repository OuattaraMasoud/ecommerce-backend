import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) { }
    async getCurrentUser(userEmail: string): Promise<User | null> {
        try {
            console.log("userId", userEmail)
            const user = await this.prisma.user.findUnique({
                where: {
                    email: userEmail
                }
            })

            console.log(user)
            return user

        } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
        }

    }

}