import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsArray()
    productIds: string[]; // Utiliser un tableau de IDs pour représenter plusieurs produits

    @IsNotEmpty()
    @IsNumber()
    totalPrice: number;
}
