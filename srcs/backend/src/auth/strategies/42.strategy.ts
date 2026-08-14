import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-42";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(
    Strategy.Strategy,
    "42",
) {

    constructor(private readonly authService: AuthService, private readonly userService: UsersService) {
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
        console.log("42 Profile:", profile['_json']);
        console.log("42 Profile:", profile.image);
        const { id, login: username, email, first_name, last_name, image: { link: photo } } = profile['_json'];
        const userByEmail = await this.userService.findbyEmail(email);
        const userByUsername = await this.userService.findbyEmail(username);
        let userId = userByEmail ? userByEmail.id : null;

        if (!userByEmail && userByUsername) {
            return {
                message: "Username already exists. Please create an account with a different username.",
            };
        }

        if (!userByEmail && !userByUsername) {
            userId = (await this.authService.registerWithOauth({
                fortyTwoId: id,
                username: username,
                email: email,
                firstName: first_name,
                lastName: last_name,
                profilePicture: photo,
                password: "",
            })).id;
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
