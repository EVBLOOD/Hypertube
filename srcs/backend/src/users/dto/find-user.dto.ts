import { IsOptional, IsString, IsInt, Min, Max, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class PaginationFindUserDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number = 20;

    @IsNotEmpty()
    @IsString()
    username!: string;
}
