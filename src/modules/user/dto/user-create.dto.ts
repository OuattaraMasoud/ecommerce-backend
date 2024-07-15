import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ description: 'User Email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'User Email' })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ description: 'User Email' })
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ description: 'User password' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 20)
    password: string;

    @ApiProperty({ description: 'The user roles' })
    @IsOptional()
    @IsArray()
    readonly role?: string[];
}
