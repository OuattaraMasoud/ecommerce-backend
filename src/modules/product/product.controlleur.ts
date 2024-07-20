import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './product.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post("create-product")
    @ApiOperation({ summary: 'Create product' })
    @ApiResponse({ status: 200, description: 'The product' })
    async createProduct(@Body() data: CreateProductDto): Promise<String> {
        return await this.productsService.createProduct(data);
    }

}