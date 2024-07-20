import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/user-create.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get("me")
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'The user' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async me(@Query('email') email: string): Promise<User> {
        console.log("Request =>", email);
        return await this.usersService.getCurrentUser(email);
    }

    @Get()
    async findUser(@Query('email') email: string): Promise<User> {
        return await this.usersService.findUser(email);
    }

    @Post()
    @ApiOperation({ summary: 'Get current user' })
    @ApiResponse({ status: 200, description: 'The user' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async createUser(@Body() data: CreateUserDto): Promise<String> {
        return await this.usersService.createUser(data);
    }


    @Patch(':id')
    async updateTodo(@Param('id') id: string, @Body() data: any, @Req() req: any): Promise<string> {
        return await this.usersService.updateUser(id, data);
    }

    @Delete(':id')
    async deleteTodo(@Param('id') id: string, @Req() req: any): Promise<string> {
        return await this.usersService.removeUser(id);
    }


}