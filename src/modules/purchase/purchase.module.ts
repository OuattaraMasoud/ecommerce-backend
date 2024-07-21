import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';

@Module({
    imports: [ConfigModule],
    controllers: [PurchaseController],
    providers: [PurchaseService],
})
export class PurchasesModule { }