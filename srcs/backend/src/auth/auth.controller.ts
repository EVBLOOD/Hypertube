import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    UseGuards,
    Req,
    Request,
    Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
// import { LocalStrategy } from './strategies/local.strategy';
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { WhitelistGuard } from "./guards/whitelist.guard";
import type { Response } from "express";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post("register")
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post("login")
    @UseGuards(AuthGuard("local"))
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        const token = (await this.authService.login(req.user)).access_token;
        res.cookie("AUTH_TOKEN", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: "/",
        });
        return { token, user: req.user };
    }

    @Get("login/42")
    @UseGuards(AuthGuard("42"))
    async login42() {
        return { message: "Redirecting to 42 login page..." };
    }

    @Get("login/42/callback")
    @UseGuards(AuthGuard("42"))
    async login42Callback(@Request() req, @Res() res: Response) {
        console.log("42 Callback User:", req.user);
        if (!req.user) {
            return { message: "User not found" };
        }
        const token = (await this.authService.login(req.user)).access_token;
        res.cookie("AUTH_TOKEN", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: "/",
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }

    @Get("verify/:token")
    verify(@Param("token") token: string) {
        return this.authService.verifyEmail(token);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Get("whois")
    async whois(@Request() req) {
        return { user: req.user };
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Post("/logout")
    logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        this.authService.logout(req.user, req.cookies?.AUTH_TOKEN);
        res.clearCookie("AUTH_TOKEN", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return { message: "Logged out successfully" };
    }
}
