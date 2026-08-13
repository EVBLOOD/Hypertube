import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-42";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(
    Strategy.Strategy,
    "42",
) {
    constructor() {
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
        const { id, username, emails, name, photos } = profile;
        return {
            fortyTwoId: id,
            username: username,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
        };
    }
}
