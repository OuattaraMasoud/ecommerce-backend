import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post('create-category')
    @ApiOperation({ summary: 'Create a category' })
    @ApiResponse({ status: 200, description: 'Category created successfully' })
    async createCategory(@Body() createCategoryDto: any): Promise<string> {
        try {
            await this.categoriesService.createCategory(createCategoryDto);
            return 'Category created successfully';
        } catch (error) {
            throw error;
        }
    }

    @Patch('update-category/:id')
    @ApiOperation({ summary: 'Update category by ID' })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    async updateCategory(
        @Param('id') id: string,
        @Body() updateCategoryDto: any,
    ): Promise<string> {
        try {
            await this.categoriesService.updateCategory(id, updateCategoryDto);
            return 'Category updated successfully';
        } catch (error) {
            throw error;
        }
    }

    // @Delete('delete-category/:id')
    // @ApiOperation({ summary: 'Delete category by ID' })
    // @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    // async deleteCategory(@Param('id') id: string): Promise<string> {
    //     try {
    //         await this.categoriesService.deleteCategory(id);
    //         return 'Category deleted successfully';
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    @Get('find-all-categories')
    @ApiOperation({ summary: 'Find all categories' })
    @ApiResponse({ status: 200, description: 'Returns all categories' })
    async findAllCategories(): Promise<any> {
        try {
            return await this.categoriesService.findAllCategories();
        } catch (error) {
            throw error;
        }
    }

    // @Get('find-categories-by-criteria')
    // @ApiOperation({ summary: 'Find categories by criteria' })
    // @ApiResponse({ status: 200, description: 'Returns categories matching the criteria' })
    // async findCategoriesByCriteria(
    //     @Query('name') name: string
    // ): Promise<any> {
    //     try {
    //         return await this.categoriesService.findCategoriesByCriteria(name);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // @Get(':id')
    // @ApiOperation({ summary: 'Find category by ID' })
    // @ApiResponse({ status: 200, description: 'Returns the category with the specified ID' })
    // async findCategoryById(@Param('id') id: string): Promise<any> {
    //     try {
    //         return await this.categoriesService.findCategoryById(id);
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}
