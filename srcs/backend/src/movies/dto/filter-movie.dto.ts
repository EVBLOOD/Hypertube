import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class FilterMovieDto {
    @IsOptional()
    @IsString()
    query?: string;

    @IsOptional()
    @IsString()
    genre?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    minRating?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1888)
    minYear?: number = 2017;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1889)
    maxYear?: number = 2026;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number = 20;

    @IsOptional()
    @IsString()
    sortBy?: string = "title"; // title, year, rating

    @IsOptional()
    @IsString()
    order?: string = "asc"; // asc, desc

    @IsOptional()
    @IsString()
    language?: string = "en";
}
