import { IsOptional, IsString } from "class-validator";

export class OAuthTokenDto {
    @IsOptional()
    @IsString()
    client?: string;

    @IsOptional()
    @IsString()
    secret?: string;

    @IsOptional()
    @IsString()
    client_id?: string;

    @IsOptional()
    @IsString()
    client_secret?: string;

    @IsOptional()
    @IsString()
    grant_type?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    password?: string;
}
