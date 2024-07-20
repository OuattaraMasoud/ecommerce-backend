import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    categoryId: string;
}
