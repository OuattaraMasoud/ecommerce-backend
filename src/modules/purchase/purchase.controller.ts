import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@ApiTags('purchases')
@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
    constructor(private readonly purchaseService: PurchaseService) { }

    @Post("create-purchase")
    @ApiOperation({ summary: 'Create a new purchase' })
    @ApiResponse({ status: 200, description: 'Purchase created successfully' })
    async createPurchase(@Body() createPurchaseDto: CreatePurchaseDto): Promise<string> {
        try {
            return await this.purchaseService.createPurchase(createPurchaseDto);
        } catch (error) {
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find a purchase by ID' })
    @ApiResponse({ status: 200, description: 'The purchase' })
    async findPurchaseById(@Param('id') id: string): Promise<any> {
        try {
            return await this.purchaseService.findPurchaseById(id);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ApiOperation({ summary: 'Find all purchases' })
    @ApiResponse({ status: 200, description: 'The purchases' })
    async findAllPurchases(): Promise<any> {
        try {
            return await this.purchaseService.findAllPurchases();
        } catch (error) {
            throw error;
        }
    }
}
