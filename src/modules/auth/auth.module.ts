import { PrismaService } from "../../database/prisma.service";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '10h' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, PrismaService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],

})
export class AuthModule { }