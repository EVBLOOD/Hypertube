import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { VerifyCallback } from "passport-google-oauth20";
import { Strategy } from "passport-google-oauth20";
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: process.env.GOOGLE_CALL_BACK,
            authorizationURL: "",
            tokenURL: "",
            scope: ["profile", "email"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        cb: VerifyCallback,
    ): Promise<any> {
        try {
            const json = profile?._json || {};
            const id = json.sub || profile?.id;
            const email = json.email || profile?.emails?.[0]?.value;
            const first_name = json.given_name || profile?.name?.givenName || "";
            const last_name = json.family_name || profile?.name?.familyName || "";
            const photo = json.picture || profile?.photos?.[0]?.value || undefined;

            if (!email) {
                return cb(new Error("No email returned by Google OAuth"));
            }

            let username = email.split("@")[0];

            const userByEmail = await this.userService.findbyEmail(email);
            let userByUsername = await this.userService.findByUsername(username);
            let userId = userByEmail ? userByEmail.id : null;

            if (!userByEmail && userByUsername) {
                username = `${username}_gg_${id || Math.floor(Math.random() * 1000)}`;
                userByUsername = await this.userService.findByUsername(username);
            }

            if (!userByEmail) {
                userId = (
                    await this.authService.registerWithOauth({
                        externalStrategyId: String(id),
                        username: username,
                        email: email,
                        firstName: first_name,
                        lastName: last_name,
                        profilePicture: photo,
                        password: "",
                    })
                ).id;
            }
            const user = {
                id: userId,
                externalStrategyId: id,
                username: username,
                email: email,
                firstName: first_name,
                lastName: last_name,
                profilePicture: photo,
            };
            cb(null, user);

            return user;
        } catch (err: any) {
            cb(err);
            return null;
        }
    }
}
