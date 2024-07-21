import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { SubCategoriesService } from './subcategory.service';

@ApiTags('subCategories')
@Controller('subCategories')
@UseGuards(JwtAuthGuard)
export class SubCategoriesController {
    constructor(private readonly subCategoriesService: SubCategoriesService) { }

    @Post('create-subcategory')
    @ApiOperation({ summary: 'Create a subcategory' })
    @ApiResponse({ status: 200, description: 'Subcategory created successfully' })
    async createSubCategory(@Body() createSubCategoryDto: CreateSubCategoryDto): Promise<string> {
        try {
            await this.subCategoriesService.createSubCategory(createSubCategoryDto);
            return 'Subcategory created successfully';
        } catch (error) {
            throw error;
        }
    }

    @Get('find-all-subcategories')
    @ApiOperation({ summary: 'Find all subcategories' })
    @ApiResponse({ status: 200, description: 'Returns all subcategories' })
    async findAllSubCategories(): Promise<any> {
        try {
            return await this.subCategoriesService.findAllSubCategory();
        } catch (error) {
            throw error;
        }
    }

    @Get('find-subcategories-by-criteria')
    @ApiOperation({ summary: 'Find subcategories by criteria' })
    @ApiResponse({ status: 200, description: 'Returns subcategories matching the criteria' })
    async findSubCategoriesByCriteria(
        @Query('name') name: string,
        @Query('description') description: string,
    ): Promise<any> {
        try {
            return await this.subCategoriesService.findSubCategoriesByCriteria(name, description);
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find subcategory by ID' })
    @ApiResponse({ status: 200, description: 'Returns the subcategory with the specified ID' })
    async findSubCategoryById(@Param('id') id: string): Promise<any> {
        try {
            return await this.subCategoriesService.findProductById(id);
        } catch (error) {
            throw error;
        }
    }

    @Patch('update-subcategory/:id')
    @ApiOperation({ summary: 'Update subcategory by ID' })
    @ApiResponse({ status: 200, description: 'Subcategory updated successfully' })
    async updateSubCategory(
        @Param('id') id: string,
        @Body() updateSubCategoryDto: CreateSubCategoryDto,
    ): Promise<string> {
        try {
            await this.subCategoriesService.updateSubCategory(id, updateSubCategoryDto);
            return 'Subcategory updated successfully';
        } catch (error) {
            throw error;
        }
    }

    @Delete('delete-subcategory/:id')
    @ApiOperation({ summary: 'Delete subcategory by ID' })
    @ApiResponse({ status: 200, description: 'Subcategory deleted successfully' })
    async deleteSubCategory(@Param('id') id: string): Promise<string> {
        try {
            await this.subCategoriesService.deleteSubCategory(id);
            return 'Subcategory deleted successfully';
        } catch (error) {
            throw error;
        }
    }
}
