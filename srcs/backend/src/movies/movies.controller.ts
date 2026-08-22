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
    HttpStatus,
    Inject,
    forwardRef,
    NotFoundException,
} from "@nestjs/common";
import { FilterMovieDto } from "./dto/filter-movie.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { VerifiedGuard } from "../auth/guards/verified.guard";
import { MoviesService } from "./movies.service";
import { PaginationMovieDto } from "./dto/pagination-movie.dto ";
import { StreamsService } from "src/streams/streams.service";
import { OptionalJwtAuthGuard } from "src/auth/guards/optional-jwt-auth.guard";
import { OptionalVerifiedGuard } from "src/auth/guards/optional-verified.guard";

@Controller("movies")
export class MoviesController {
    constructor(
        private readonly moviesService: MoviesService,
        private readonly streamService: StreamsService,
    ) { }

    @UseGuards(OptionalJwtAuthGuard, OptionalVerifiedGuard)
    @Get()
    async findAll(@Query() filters: FilterMovieDto, @Req() req) {
        return this.moviesService.getLibrary(filters, req.user?.id);
    }

    @Get("curated")
    async getCuratedTrending() {
        return await this.moviesService.getCuratedTrending();
    }

    @UseGuards(OptionalJwtAuthGuard, OptionalVerifiedGuard)
    @Get("trending")
    async trendingPage(@Query() paging: PaginationMovieDto, @Req() req) {
        return await this.moviesService.getTrending(paging, req.user?.id);
    }

    @Get("popular_one")
    async heroPage() {
        return await this.moviesService.getHeroMovie();
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("wishlist")
    async wishlistPage(@Query() paging: PaginationMovieDto, @Req() req) {
        return await this.moviesService.getWishlist(paging, req.user.id);
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
    getSubtitleFile(@Param("imdbId") imdbId: string, @Query("language") language: string) {
        return this.moviesService.getDownloadedFileLink(imdbId, language);
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
    async findOne(@Param("imdbId") imdbId: string, @Req() req) {
        const movie = await this.moviesService.getMovieDetails(
            imdbId,
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
        return await this.moviesService.sendInvite(imdbId, title, userInput, req.user?.id);
    }

    @UseGuards(JwtAuthGuard, VerifiedGuard)
    @Get("invite/:uuid")
    async handelInvite(
        @Param("uuid") uuid: string,
        @Query('accept') accept: boolean,
        @Req() req,
        @Res() res
    ) {
        const result = await this.moviesService.handleInvite(uuid, req.user?.id, accept);
        if (result) {
            res.redirect(`${process.env.FRONTEND_URL}/watch/${result.imdbId}?token=${result.roomId}`);
        }
        return result;
    }

}
