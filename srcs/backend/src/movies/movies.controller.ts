import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    UseGuards,
    Req,
    Headers,
    Res,
    NotFoundException,
    BadRequestException,
    StreamableFile,
} from "@nestjs/common";
import { FilterMovieDto } from "./dto/filter-movie.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { VerifiedGuard } from "../auth/guards/verified.guard";
import { MoviesService } from "./movies.service";
import { CommentsService } from "../comments/comments.service";
import { CreateCommentDto } from "../comments/dto/create-comment.dto";
import { PaginationCommentDto } from "../comments/dto/pagination-comments.dto ";
import { PaginationMovieDto } from "./dto/pagination-movie.dto ";
import { StreamsService } from "src/streams/streams.service";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";
import { OptionalVerifiedGuard } from "src/auth/guards/optional-verified.guard";
import fsPromises from "fs/promises";
import type { DefaultLanguage } from "src/common/decorators/language.decorator";
import { Language } from "src/common/decorators/language.decorator";

@Controller("movies")
export class MoviesController {
    constructor(
        private readonly moviesService: MoviesService,
        private readonly streamService: StreamsService,
        private readonly commentService: CommentsService,
    ) {}

    @UseGuards(OptionalJwtAuthGuard, OptionalVerifiedGuard)
    @Get()
    async findAll(
        @Query() filters: FilterMovieDto,
        @Req() req,
        @Language() lang: DefaultLanguage,
    ) {
        const hasFilters =
            filters.query ||
            filters.genre ||
            filters.minYear ||
            filters.maxYear ||
            filters.minRating ||
            filters.sortBy ||
            filters.order ||
            (filters.page && filters.page > 1);

        if (!hasFilters && Object.keys(filters).length === 0) {
            const trending = await this.moviesService.getTrending(
                { page: 1, limit: 20 },
                lang,
                req.user?.id,
            );
            const list = Array.isArray(trending?.data)
                ? trending.data
                : Array.isArray(trending)
                  ? trending
                  : [];
            return list.map((m: any) => ({
                id: m.id,
                name: m.title,
                title: m.title,
            }));
        }

        return this.moviesService.getLibrary(filters, req.user?.id, lang);
    }

    @Get("curated")
    async getCuratedTrending(@Language() lang: DefaultLanguage) {
        return await this.moviesService.getCuratedTrending(lang);
    }

    @UseGuards(OptionalJwtAuthGuard, OptionalVerifiedGuard)
    @Get("trending")
    async trendingPage(
        @Query() paging: PaginationMovieDto,
        @Req() req,
        @Language() lang: DefaultLanguage,
    ) {
        return await this.moviesService.getTrending(paging, lang, req.user?.id);
    }

    @Get("popular_one")
    async heroPage(@Language() lang: DefaultLanguage) {
        return await this.moviesService.getHeroMovie(lang);
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("wishlist")
    async wishlistPage(
        @Query() paging: PaginationMovieDto,
        @Req() req,
        @Language() lang: DefaultLanguage,
    ) {
        return await this.moviesService.getWishlist(paging, req.user.id, lang);
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Post("interaction/:imdbId")
    async interaction(
        @Param("imdbId") imdbId: string,
        @Body("interaction") interaction: number,
        @Req() req,
    ) {
        return await this.moviesService.insertOrUpdateInteraction(
            req.user.id,
            imdbId,
            interaction,
        );
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Post("wishlist/:imdbId")
    async wishlistToggle(@Param("imdbId") imdbId: string, @Req() req) {
        return this.moviesService.toggleWishlist(req.user.id, imdbId);
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("subtitles/:imdbId")
    getSubtitle(@Param("imdbId") imdbId: string) {
        return this.moviesService.searchSubtitles(imdbId);
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("subtitle_file/:imdbId")
    async getSubtitleFile(
        @Param("imdbId") imdbId: string,
        @Query("language") language: string,
        @Res({ passthrough: true }) res,
    ) {
        const filePath = await this.moviesService.getDownloadedFileLink(
            imdbId,
            language,
        );

        let rawText = await fsPromises.readFile(filePath, "utf-8");

        if (rawText.charCodeAt(0) === 0xfeff) {
            rawText = rawText.slice(1);
        }

        if (!rawText.trim().startsWith("WEBVTT")) {
            const convertedText = rawText.replace(
                /(\d{2}:\d{2}:\d{2}),(\d{3})/g,
                "$1.$2",
            );
            rawText = `WEBVTT\n\n${convertedText}`;
        }

        const fileBuffer = Buffer.from(rawText, "utf-8");

        return new StreamableFile(fileBuffer, {
            type: "text/vtt; charset=utf-8",
            disposition: `inline; filename="subtitle_${imdbId}_${language}.vtt"`,
            length: fileBuffer.length,
        });
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("qualities/:imdbId")
    getQualities(@Param("imdbId") imdbId: string) {
        return this.moviesService.getQualitiesAvailable(imdbId);
    }

    @Post("watch")
    startStream(
        @Body("imdbId") imdbId: string,
        @Headers("range") range: string,
        @Res() res,
    ) {
        void this.streamService
            .stream(imdbId, "1080p", range, res)
            .catch((error: any) => {
                if (!res.headersSent) {
                    res.status(500).json({
                        message: "Failed to start stream",
                        error: error?.message || "Unknown error",
                    });
                }
            });
    }

    @Get("watch/:id")
    startStream1(
        @Param("id") imdbId: string,
        @Headers("range") range: string,
        @Query("quality") quality: string,
        @Res() res,
    ) {
        void this.streamService
            .stream(imdbId, quality, range, res)
            .catch((error: any) => {
                if (!res.headersSent) {
                    res.status(500).json({
                        message: "Failed to start stream",
                        error: error?.message || "Unknown error",
                    });
                }
            });
    }

    @Post(":imdbId/progress")
    async saveProgress(
        @Param("imdbId") imdbId: string,
        @Body("seconds") seconds: number,
        @Body("isLive") isLive: boolean,
        @Req() req,
    ) {
        return this.moviesService.updateProgress(
            req.user?.id || 1,
            imdbId,
            seconds,
            isLive,
        );
    }

    @UseGuards(OptionalJwtAuthGuard, OptionalVerifiedGuard)
    @Get(":imdbId")
    async findOne(
        @Param("imdbId") imdbId: string,
        @Req() req,
        @Language() lang: DefaultLanguage,
    ) {
        const movie = await this.moviesService.getMovieDetails(
            imdbId,
            lang,
            req.user?.id,
        );
        if (!movie) {
            throw new NotFoundException(
                `Movie with imdbId ${imdbId} not found`,
            );
        }
        return movie;
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Post("invite/:imdbId")
    async invite(
        @Param("imdbId") imdbId: string,
        @Body("title") title: string,
        @Body("userInput") userInput: string,
        @Req() req,
    ) {
        return await this.moviesService.sendInvite(
            imdbId,
            title,
            userInput,
            req.user?.id,
        );
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("invite/:uuid")
    async handelInvite(
        @Param("uuid") uuid: string,
        @Query("accept") accept: boolean,
        @Req() req,
        @Res() res,
    ) {
        const result = await this.moviesService.handleInvite(
            uuid,
            req.user?.id,
            accept,
        );
        if (result) {
            res.redirect(
                `${process.env.FRONTEND_URL}/watch/${result.imdbId}?token=${result.roomId}`,
            );
        }
        return result;
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get(":imdbId/comments")
    async getMovieComments(
        @Param("imdbId") imdbId: string,
        @Query() paging: PaginationCommentDto,
        @Req() req,
    ) {
        const userId = req.user?.id || -1;
        return this.commentService.findByMovie(imdbId, paging, userId);
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Post(":imdbId/comments")
    async createMovieComment(
        @Param("imdbId") imdbId: string,
        @Body() dto: CreateCommentDto,
        @Req() req,
    ) {
        const content = dto.comment || dto.content;
        if (!content) {
            throw new BadRequestException("comment content is required");
        }
        return this.commentService.create(req.user?.id, imdbId, content);
    }
}
