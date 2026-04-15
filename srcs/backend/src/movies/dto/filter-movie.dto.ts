import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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
  minYear?: number;


  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1889)
  maxYear?: number;

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
  sortBy?: string = 'title'; // title, year, rating
}