import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get("me")
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'The user' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async me(@Query('email') email: string) {

    }


}
