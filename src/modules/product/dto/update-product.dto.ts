import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    subCategoryId?: string;

    @IsOptional()
    @IsArray()
    imagesUrl: string[];
}