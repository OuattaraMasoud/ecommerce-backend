
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

}