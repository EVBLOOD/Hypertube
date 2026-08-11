import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, Headers, Res, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { MoviesService } from './movies.service';
import { PaginationMovieDto } from './dto/pagination-movie.dto ';
import { StreamsService } from 'src/streams/streams.service';

@Controller('movies')
// @UseGuards(JwtAuthGuard, VerifiedGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService, private readonly streamService: StreamsService) { }

  @Get()
  async findAll(@Query() filters: FilterMovieDto, @Req() req) {
    return this.moviesService.getLibrary(filters, 1);
  }


  @Get('curated')
  async getCuratedTrending() {
    return await this.moviesService.getCuratedTrending()
  }

  @Get('trending')
  async trendingPage(@Query() paging: PaginationMovieDto) {
    return await this.moviesService.getTrending(paging)
  }

  @Get('popular_one')
  async heroPage() {
    return await this.moviesService.getHeroMovie()
  }

  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @Get('wishlist')
  async wishlistPage(@Query() paging: PaginationMovieDto, @Req() req) {
    return await this.moviesService.getWishlist(paging, req.user.id)
  }

  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @Post('interaction/:imdbId')
  async interaction(
    @Param('imdbId') imdbId: string,
    @Body('interaction') interaction: number,
    @Req() req
  ) {
    return await this.moviesService.insertOrUpdateInteraction(req.user.id, imdbId, interaction);
  }

  @UseGuards(JwtAuthGuard, VerifiedGuard)
  @Post('wishlist/:imdbId')
  async wishlistToggle(
    @Param('imdbId') imdbId: string,
    @Req() req
  ) {
    return await this.moviesService.toggleWishlist(req.user.id, imdbId);
  }

  @Post('watch')
  startStream(
    @Body('imdbId') imdbId: string,
    @Headers('range') range: string,
    @Res() res,
  ) {
    void this.streamService.stream(imdbId, '1080p', range, res).catch((error: any) => {
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Failed to start stream',
          error: error?.message || 'Unknown error',
        });
      }
    });
  }

  @Get('watch/:id')
  startStream1(
    @Param('id') imdbId: string,
    @Headers('range') range: string,
    @Res() res,
  ) {
    void this.streamService.stream(imdbId, '1080p', range, res).catch((error: any) => {
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Failed to start stream',
          error: error?.message || 'Unknown error',
        });
      }
    });
  }

  @Post(':imdbId/progress')
  async saveProgress(
    @Param('imdbId') imdbId: string,
    @Body('seconds') seconds: number,
    @Body('isLive') isLive: boolean,
    @Req() req
  ) {
    return this.moviesService.updateProgress(req.user?.id || 1, imdbId, seconds, isLive);
  }

  @Get(':imdbId')
  async findOne(@Param('imdbId') imdbId: string) {
    return await this.moviesService.getMovieDetails(imdbId);
  }
}