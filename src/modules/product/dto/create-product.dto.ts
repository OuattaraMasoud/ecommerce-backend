import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsOptional()
    @IsString()
    subCategoryId?: string;

    @IsNotEmpty()
    @IsArray()
    imagesUrl: string[];
}