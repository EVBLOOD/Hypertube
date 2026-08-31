import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { OAuthTokenDto } from "./dto/oauth-token.dto";
import type { Request } from "express";
import { ApiDoc } from "../docs/decorators/api-doc.decorator";

@Controller("oauth")
export class OAuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("token")
    @ApiDoc({ target: "oauth.token" })
    async token(
        @Body() body: OAuthTokenDto,
        @Headers("authorization") authHeader?: string,
        @Req() req?: Request,
    ) {
        let client = body.client || body.client_id;
        let secret = body.secret || body.client_secret;

        if ((!client || !secret) && authHeader?.startsWith("Basic ")) {
            try {
                const base64Credentials = authHeader.substring(6);
                const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
                const [basicUser, basicPass] = decoded.split(":");
                client = client || basicUser;
                secret = secret || basicPass;
            } catch (err) {
            }
        }

        return this.authService.generateOAuthToken({
            ...body,
            client,
            secret,
        });
    }
}
