import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePurchaseDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    productId?: string;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsNumber()
    totalPrice?: number;
}