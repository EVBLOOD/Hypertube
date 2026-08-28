import { IsIn, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class InteractionCommentDto {
    @Type(() => Number)
    @IsInt({ message: "Interaction must be an integer" })
    @IsIn([1, 2], { message: "Interaction must be 1 (like) or 2 (dislike)" })
    interaction!: number;
}
