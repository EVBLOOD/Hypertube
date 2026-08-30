import {
    IsEmail,
    IsOptional,
    IsString,
    IsEnum,
    MinLength,
    Matches,
    ValidateIf,
} from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsOptional()
    @IsString()
    profile_picture_url?: string;

    @IsOptional()
    @IsString()
    profilePictureUrl?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @ValidateIf(
        (o) =>
            o.password !== undefined &&
            o.password !== null &&
            o.password !== "",
    )
    @IsOptional()
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters" })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            "Password too weak: requires uppercase, lowercase, and a number/special char",
    })
    password?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsEnum(["en", "fr", "ar"])
    preferredLanguage?: "en" | "fr" | "ar";

    @IsEnum(["public", "private"])
    @IsOptional()
    privacy?: "public" | "private";
}
