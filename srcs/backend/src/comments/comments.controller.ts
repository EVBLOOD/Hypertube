import {
    Controller,
    Get,
    Param,
    UseGuards,
    Post,
    Body,
    Req,
    Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CommentsService } from "./comments.service";
import { PaginationCommentDto } from "./dto/pagination-comments.dto ";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";

@Controller("comments")
export class CommentsController {
    constructor(private readonly commentService: CommentsService) {}

    @UseGuards(OptionalJwtAuthGuard)
    @Get(":imdbId")
    async getMovieComments(
        @Param("imdbId") imdbId: string,
        @Query() paging: PaginationCommentDto,
        @Req() req,
    ) {
        const userId = req.user?.id || -1;
        return this.commentService.findByMovie(imdbId, paging, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":imdbId")
    async createMovieComment(
        @Param("imdbId") imdbId: string,
        @Body("content") content: string,
        @Req() req,
    ) {
        return this.commentService.create(req.user?.id, imdbId, content);
    }

    @UseGuards(JwtAuthGuard)
    @Post("interaction/:commentId")
    async addInteraction(
        @Param("commentId") commentId: number,
        @Body("interaction") interaction: number,
        @Req() req,
    ) {
        return this.commentService.addInteraction(
            commentId,
            interaction,
            req.user?.id,
        );
    }
}
