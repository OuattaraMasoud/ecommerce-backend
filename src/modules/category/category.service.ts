import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) { }
    

    

}