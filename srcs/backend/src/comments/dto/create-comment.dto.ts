import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import sanitizeHtml from "sanitize-html";

export class CreateCommentDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: "Comment cannot exceed 1000 characters" })
    @Transform(({ value }) =>
        typeof value === "string"
            ? sanitizeHtml(value.trim(), {
                  allowedTags: [],
                  allowedAttributes: {},
              })
            : value,
    )
    content?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: "Comment cannot exceed 1000 characters" })
    @Transform(({ value }) =>
        typeof value === "string"
            ? sanitizeHtml(value.trim(), {
                  allowedTags: [],
                  allowedAttributes: {},
              })
            : value,
    )
    comment?: string;

    @IsOptional()
    @IsString()
    movie_id?: string;

    @IsOptional()
    @IsString()
    movieId?: string;

    @IsOptional()
    @IsString()
    imdbId?: string;
}

export class UpdateCommentDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: "Comment cannot exceed 1000 characters" })
    @Transform(({ value }) =>
        typeof value === "string"
            ? sanitizeHtml(value.trim(), {
                  allowedTags: [],
                  allowedAttributes: {},
              })
            : value,
    )
    comment?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: "Comment cannot exceed 1000 characters" })
    @Transform(({ value }) =>
        typeof value === "string"
            ? sanitizeHtml(value.trim(), {
                  allowedTags: [],
                  allowedAttributes: {},
              })
            : value,
    )
    content?: string;

    @IsOptional()
    @IsString()
    username?: string;
}
