import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export class PaginationCommentDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number = 20;

    @IsOptional()
    @IsEnum(["createdAt", "interactionCount"])
    sort?: string = "createdAt";
}
