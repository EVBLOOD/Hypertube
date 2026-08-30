import {
    Controller,
    Get,
    Param,
    UseGuards,
    Post,
    Patch,
    Delete,
    Body,
    Req,
    Query,
    ParseIntPipe,
    BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WhitelistGuard } from "../auth/guards/whitelist.guard";
import { ApiScopeGuard } from "../auth/guards/api-scope.guard";
import { CommentsService } from "./comments.service";
import { PaginationCommentDto } from "./dto/pagination-comments.dto ";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";
import { CreateCommentDto, UpdateCommentDto } from "./dto/create-comment.dto";
import { InteractionCommentDto } from "./dto/interaction-comment.dto";

@Controller("comments")
export class CommentsController {
    constructor(private readonly commentService: CommentsService) {}

    @Get()
    async getLatestComments() {
        return this.commentService.getLatestComments();
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(":id")
    async getCommentOrMovieComments(
        @Param("id") id: string,
        @Query() paging: PaginationCommentDto,
        @Req() req,
    ) {

        if (/^\d+$/.test(id)) {
            return this.commentService.getCommentById(parseInt(id, 10));
        }

        const userId = req.user?.id || -1;
        return this.commentService.findByMovie(id, paging, userId);
    }

    @UseGuards(ApiScopeGuard)
    @Post()
    async createComment(@Body() dto: CreateCommentDto, @Req() req) {
        const movieId = dto.movie_id || dto.movieId || dto.imdbId;
        const content = dto.comment || dto.content;

        if (!movieId) {
            throw new BadRequestException("movie_id is required");
        }
        if (!content) {
            throw new BadRequestException("comment is required");
        }

        return this.commentService.create(req.user?.id, movieId, content);
    }

    @UseGuards(ApiScopeGuard)
    @Patch(":id")
    async updateComment(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateCommentDto,
        @Req() req,
    ) {
        const content = dto.comment || dto.content;
        if (!content) {
            throw new BadRequestException("comment content is required");
        }

        return this.commentService.updateComment(
            id,
            content,
            req.user?.id,
            dto.username || req.user?.username,
        );
    }

    @UseGuards(ApiScopeGuard)
    @Delete(":id")
    async deleteComment(
        @Param("id", ParseIntPipe) id: number,
        @Req() req,
    ) {
        return this.commentService.deleteComment(id, req.user?.id);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Post(":imdbId")
    async createMovieComment(
        @Param("imdbId") imdbId: string,
        @Body() dto: CreateCommentDto,
        @Req() req,
    ) {
        const content = dto.comment || dto.content;
        if (!content) {
            throw new BadRequestException("comment is required");
        }
        return this.commentService.create(req.user?.id, imdbId, content);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
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
