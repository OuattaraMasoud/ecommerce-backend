import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'The user' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async me(@Req() req: any, @Query('keyboard') keyboard: string): Promise<User[]> {
        console.log("Request =>", req.user);

        return await this.usersService.getCurrentUser(req.user.id);
    }


}