import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import sanitizeHtml from "sanitize-html";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty({ message: "Comment content cannot be empty" })
    @MaxLength(1000, { message: "Comment cannot exceed 1000 characters" })
    @Transform(({ value }) =>
        typeof value === "string"
            ? sanitizeHtml(value.trim(), {
                  allowedTags: [],
                  allowedAttributes: {},
              })
            : value,
    )
    content!: string;
}
