import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { Strategy } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
    ) {
        super({
            clientID: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            callbackURL: process.env.GITHUB_CALL_BACK || "",
            scope: ["user:email"],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        cb: (err: any, user?: any) => void,
    ): Promise<any> {
        try {
            const email =
                profile?.emails?.[0]?.value ||
                profile?._json?.email;

            if (!email) {
                return cb(
                    new Error("No email associated with this GitHub account"),
                );
            }

            const json = profile?._json || {};
            const id = json.id || profile?.id;
            let username = json.login || profile?.username || email.split("@")[0];
            const name = json.name || profile?.displayName || "";
            const photo = json.avatar_url || profile?.photos?.[0]?.value || undefined;

            const userByEmail = await this.userService.findbyEmail(email);
            let userByUsername = await this.userService.findByUsername(username);
            let userId = userByEmail ? userByEmail.id : null;

            if (!userByEmail && userByUsername) {
                username = `${username}_gh_${id || Math.floor(Math.random() * 1000)}`;
                userByUsername = await this.userService.findByUsername(username);
            }

            const nameParts = name ? name.split(" ") : [];
            const first_name = nameParts.length > 0 ? nameParts[0] : "";
            const last_name =
                nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

            if (!userByEmail) {
                userId = (
                    await this.authService.registerWithOauth({
                        externalStrategyId: String(id),
                        username: username,
                        email: email,
                        firstName: first_name,
                        lastName: last_name,
                        profilePicture: photo ? photo : undefined,
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

            return cb(null, user);
        } catch (err) {
            return cb(err);
        }
    }
}
