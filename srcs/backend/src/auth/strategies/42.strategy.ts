import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-42";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(
    Strategy.Strategy,
    "42",
) {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
    ) {
        super({
            clientID: process.env.FORTY_TWO_CLIENT_ID || "",
            clientSecret: process.env.FORTY_TWO_CLIENT_SECRET || "",
            callbackURL: process.env.FORTY_TWO_CALL_BACK,
            authorizationURL: "",
            tokenURL: "",
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
    ): Promise<any> {
        const json = profile?._json || {};
        const id = json.id || profile?.id;
        let username = json.login || profile?.username;
        const email = json.email || profile?.emails?.[0]?.value;
        const first_name = json.first_name || "";
        const last_name = json.last_name || "";
        const photo = json.image?.link || profile?.photos?.[0]?.value || undefined;

        if (!email) {
            throw new UnauthorizedException("No email returned by 42 OAuth");
        }

        const userByEmail = await this.userService.findbyEmail(email);
        let userByUsername = username ? await this.userService.findByUsername(username) : null;
        let userId = userByEmail ? userByEmail.id : null;

        if (!userByEmail && userByUsername) {
            username = `${username}_42_${id || Math.floor(Math.random() * 1000)}`;
            userByUsername = await this.userService.findByUsername(username);
        }

        if (!userByEmail) {
            userId = (
                await this.authService.registerWithOauth({
                    fortyTwoId: String(id),
                    username: username || `42_${id}`,
                    email: email,
                    firstName: first_name,
                    lastName: last_name,
                    profilePicture: photo,
                    password: "",
                })
            ).id;
        }

        return {
            id: userId,
            fortyTwoId: id,
            username: username,
            email: email,
            firstName: first_name,
            lastName: last_name,
            profilePicture: photo,
        };
    }
}
