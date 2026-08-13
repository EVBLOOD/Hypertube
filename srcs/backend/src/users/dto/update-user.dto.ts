import { IsEmail, IsOptional, IsString, IsEnum } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    // @IsString()
    // firstName?: string;

    // @IsOptional()
    // @IsString()
    // lastName?: string;
    @IsOptional()
    @IsEmail()
    email?: string;

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
