import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SubCategoriesController } from './subcategory.controller';
import { SubCategoriesService } from './subcategory.service';

@Module({
    imports: [ConfigModule],
    controllers: [SubCategoriesController],
    providers: [SubCategoriesService],
})
export class SubCategoriesModule { }
