import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './product.service';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post('create-product')
    @ApiOperation({ summary: 'Create a product' })
    @ApiResponse({ status: 200, description: 'Product created successfully' })
    async createProduct(@Body() createProductDto: CreateProductDto): Promise<string> {
        try {
            await this.productsService.createProduct(createProductDto);
            return 'Product created successfully';
        } catch (error) {
            throw error;
        }
    }

    @Get('find-all-products')
    @ApiOperation({ summary: 'Find all available products' })
    @ApiResponse({ status: 200, description: 'Returns all products' })
    async findAllProducts(): Promise<any> {
        try {
            return await this.productsService.findAllProducts();
        } catch (error) {
            throw error;
        }
    }

    @Get('find-products-by-criteria')
    @ApiOperation({ summary: 'Find products by criteria' })
    @ApiResponse({ status: 200, description: 'Returns products matching the criteria' })
    async findProductsByCriteria(
        @Query('categoryId') categoryId: string,
        @Query('subCategoryId') subCategoryId: string,
    ): Promise<any> {
        try {
            return await this.productsService.findProductsByCriteria(categoryId, subCategoryId);
        } catch (error) {
            throw error;
        }
    }
    @Get('user-find-products-by-criteria')
    @ApiOperation({ summary: 'Find products by criteria' })
    @ApiResponse({ status: 200, description: 'Returns products matching the criteria' })
    async userFindProductsByCriteria(
        @Query('input') input: string,

    ): Promise<any> {
        try {
            return await this.productsService.userFindProductsByCriteria(input);
        } catch (error) {
            throw error;
        }
    }
    @Get('find-products-by-category')
    @ApiOperation({ summary: 'Find products by category' })
    @ApiResponse({ status: 200, description: 'Returns products matching the category' })
    async findProductsByCategory(

        @Query('categoryId') categoryId: string,
    ): Promise<any> {
        try {
            return await this.productsService.findProductsByCategory(categoryId);
        } catch (error) {
            throw error;
        }
    }
    @Get('find-recommanded-products')
    @ApiOperation({ summary: 'Find products by category' })
    @ApiResponse({ status: 200, description: 'Returns products matching the category' })
    async recommendProductsForUser(

        @Query('userId') userId: string,
    ): Promise<any> {
        try {
            return await this.productsService.recommendProductsForUser(userId);
        } catch (error) {
            throw error;
        }
    }
    @Get('find-recent-products')
    @ApiOperation({ summary: 'Find recent products' })
    @ApiResponse({ status: 200, description: 'Returns recent added products ' })
    async findRecentProducts(): Promise<any> {
        try {
            return await this.productsService.findRecentProducts();
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find product by ID' })
    @ApiResponse({ status: 200, description: 'Returns the product with the specified ID' })
    async findProductById(@Param('id') id: string): Promise<any> {
        try {
            return await this.productsService.findProductById(id);
        } catch (error) {
            throw error;
        }
    }

    @Patch('update-product/:id')
    @ApiOperation({ summary: 'Update product by ID' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async updateProduct(
        @Param('id') id: string,
        @Body() updateProductDto: CreateProductDto,
    ): Promise<string> {
        try {
            await this.productsService.updateProduct(id, updateProductDto);
            return 'Product updated successfully';
        } catch (error) {
            throw error;
        }
    }

    @Delete('delete-product/:id')
    @ApiOperation({ summary: 'Delete product by ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async deleteProduct(@Param('id') id: string): Promise<string> {
        try {
            await this.productsService.deleteProduct(id);
            return 'Product deleted successfully';
        } catch (error) {
            throw error;
        }
    }
}
