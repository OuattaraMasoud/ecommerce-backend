import { Module } from '@nestjs/common';
import { ProductsService } from './product.service';
import { ProductsController } from './product.controlleur';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule { }