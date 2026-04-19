import { Controller, Get, Post, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { MoviesService } from './movies.service';

@Controller('movies')
// @UseGuards(JwtAuthGuard, VerifiedGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async findAll(@Query() filters: FilterMovieDto, @Req() req) {
    return this.moviesService.getLibrary(filters, 1);
  }

  @Get('popular_one')
  async heroPage() {
    // ss
    return await this.moviesService.getHeroMovie()
  }

  @Get(':imdbId')
  async findOne(@Param('imdbId') imdbId: string) {
    return this.moviesService.getMovieDetails(imdbId);
  }

  @Post(':imdbId/progress')
  async saveProgress(
    @Param('imdbId') imdbId: string,
    @Body('seconds') seconds: number,
    @Body('isLive') isLive: boolean,
    @Req() req
  ) {
    return this.moviesService.updateProgress(req.user.id, imdbId, seconds, isLive);
  }
}