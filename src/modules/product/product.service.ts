import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {

    }
    async createProduct(product: CreateProductDto): Promise<string> {
        console.log("produit", product)
        try {
            await this.prisma.product.create({ data: product });
            return "Product created successfully";
        } catch (error) {
            throw error;
        }
    }
}