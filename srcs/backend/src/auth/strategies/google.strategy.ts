import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { VerifyCallback } from "passport-google-oauth20";
import { Strategy } from "passport-google-oauth20";
@Injectable()
export class GoogleStrategy extends PassportStrategy(
    Strategy,
    "google",
) {
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

        console.log("Google Profile:", profile);



        const {
            sub: id,
            email,
            given_name: first_name,
            family_name: last_name,
            picture: photo,
        } =  profile._json ;

        const username = email?.split('@')[0];

        const userByEmail = await this.userService.findbyEmail(email);
        const userByUsername = await this.userService.findbyEmail(username);
        let userId = userByEmail ? userByEmail.id : null;

        if (!userByEmail && userByUsername) {
            return {
                message:
                    "Username already exists. Please create an account with a different username.",
            };
        }

        if (!userByEmail && !userByUsername) {
            userId = (
                await this.authService.registerWithOauth({
                    externalStrategyId: id,
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
        }
        cb(null, user);

        return user;
    }
}
