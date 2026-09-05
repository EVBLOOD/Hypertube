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
import { VerifiedGuard } from "./guards/verified.guard";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import type { DefaultLanguage } from "src/common/decorators/language.decorator";
import { Language } from "src/common/decorators/language.decorator";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("register")
    register(@Body() dto: RegisterDto, @Language() language: DefaultLanguage) {
        return this.authService.register(dto, language);
    }

    @Post("login")
    @UseGuards(AuthGuard("local"))
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        const token = (await this.authService.login(req.user)).access_token;
        res.cookie("AUTH_TOKEN", token, {
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: "/",
        });
        return { token, user: req.user };
    }

    @Post("request-reset-password")
    async requestResetPassword(@Body() body: { email: string }) {
        return this.authService.requestResetPassword(body.email);
    }

    @Post("reset-password")
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

    @Get("login/google")
    @UseGuards(AuthGuard("google"))
    async loginGoogle() {
        return { message: "Redirecting to google login page..." };
    }

    @Get("login/google/callback")
    @UseGuards(AuthGuard("google"))
    async loginGoogleCallback(@Request() req, @Res() res: Response) {
        console.log("google Callback User:", req.user);
        if (!req.user) {
            return { message: "User not found" };
        }
        const token = (await this.authService.login(req.user)).access_token;
        res.cookie("AUTH_TOKEN", token, {
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: "/",
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }

    @Get("login/github")
    @UseGuards(AuthGuard("github"))
    async loginGithub() {
        return { message: "Redirecting to github login page..." };
    }

    @Get("login/github/callback")
    @UseGuards(AuthGuard("github"))
    async loginGithubCallback(@Request() req, @Res() res: Response) {
        console.log("github Callback User:", req.user);
        if (!req.user) {
            return { message: "User not found" };
        }
        const token = (await this.authService.login(req.user)).access_token;
        res.cookie("AUTH_TOKEN", token, {
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: "/",
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
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
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            path: "/",
        });

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }

    @Get("verify/:token")
    async verify(@Param("token") token: string, @Res() res: Response) {
        const result = await this.authService.verifyEmail(token);
        if (result.message === "Email verified successfully") {
            res.redirect(`${process.env.FRONTEND_URL}?verify=success`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}?verify=failed`);
        }
        return result;
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("verify-email-change/:token")
    async verifyEmailChange(
        @Param("token") token: string,
        @Req() req,
        @Res() res: Response,
    ) {
        const result = await this.authService.verifyEmailChange(
            token,
            req.user.id,
        );
        if (result.message === "Email change verified successfully") {
            res.redirect(`${process.env.FRONTEND_URL}?emailChange=success`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}?emailChange=failed`);
        }
        return result;
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("change-password/:token")
    async changePassword(
        @Param("token") token: string,
        @Req() req,
        @Res() res: Response,
    ) {
        const result = await this.authService.passwordChange(
            token,
            req.user.id,
        );
        if (result.message === "Password changed successfully") {
            res.redirect(`${process.env.FRONTEND_URL}?passwordChange=success`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}?passwordChange=failed`);
        }
        return result;
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
            // httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return { message: "Logged out successfully" };
    }
}
