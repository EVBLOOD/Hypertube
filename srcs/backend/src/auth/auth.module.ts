import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { MailModule } from "src/mails/mails.module";
import { LocalStrategy } from "./strategies/local.strategy";
import { FortyTwoStrategy } from "./strategies/42.strategy";
import { WsJwtGuard } from "./guards/ws-jwt.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        MailModule,
        UsersModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET || "",
            signOptions: {
                expiresIn: "1h",
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, LocalStrategy, FortyTwoStrategy, WsJwtGuard],
})
export class AuthModule {}
