import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;
}