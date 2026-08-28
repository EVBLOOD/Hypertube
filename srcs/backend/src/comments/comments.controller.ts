import {
    Controller,
    Get,
    Param,
    UseGuards,
    Post,
    Body,
    Req,
    Query,
    ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CommentsService } from "./comments.service";
import { PaginationCommentDto } from "./dto/pagination-comments.dto ";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { InteractionCommentDto } from "./dto/interaction-comment.dto";

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
        @Body() dto: CreateCommentDto,
        @Req() req,
    ) {
        return this.commentService.create(req.user?.id, imdbId, dto.content);
    }

    @UseGuards(JwtAuthGuard)
    @Post("interaction/:commentId")
    async addInteraction(
        @Param("commentId", ParseIntPipe) commentId: number,
        @Body() dto: InteractionCommentDto,
        @Req() req,
    ) {
        return this.commentService.addInteraction(
            commentId,
            dto.interaction,
            req.user?.id,
        );
    }
}
