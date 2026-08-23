import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(
    Strategy,
    "github",
) {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
    ) {
        super({
            clientID: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            callbackURL: process.env.GITHUB_CALL_BACK || "",
            scope: ['user:email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        cb: (err: any, user?: any) => void,
    ): Promise<any> {

        console.log("Github Profile:", profile);

        if (!profile.emails || profile.emails.length === 0) {
            return cb(new Error("No email associated with this GitHub account"));
        }

        let {
            id,
            login: username,
            name,
            avatar_url: photo,
        } = profile._json;

        let {
            emails: [{ value: email }],
        } = profile;

        if (!username) {
            username = email.split('@')[0];
        }




        const userByEmail = await this.userService.findbyEmail(email);
        const userByUsername = await this.userService.findbyEmail(username);
        let userId = userByEmail ? userByEmail.id : null;

        if (!userByEmail && userByUsername) {
            return {
                message:
                    "Username already exists. Please create an account with a different username.",
            };
        }

        const nameParts = name ? name.split(' ') : [];
        const first_name = nameParts.length > 0 ? nameParts[0] : '';
        const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';


        if (!userByEmail && !userByUsername) {
            userId = (
                await this.authService.registerWithOauth({
                    externalStrategyId: id,
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
        }

        return cb(null, user);
    }
}
