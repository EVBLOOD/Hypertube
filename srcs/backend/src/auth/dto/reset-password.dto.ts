import { MinLength, Matches, IsString, IsNotEmpty } from "class-validator";

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty({ message: "Token is required" })
    token!: string;

    @MinLength(8, { message: "Password must be at least 8 characters" })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            "Password too weak: requires uppercase, lowercase, and a number/special char",
    })
    newPassword!: string;
}
