import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) { }
    async getCurrentUser(userId: string): Promise<User[]> {
        //

        console.log("userId", userId)
        const user = await this.prisma.user.findMany({

        })

        console.log(user)
        return user


    }

}