import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, Headers, Res, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { MoviesService } from './movies.service';
import { PaginationMovieDto } from './dto/pagination-movie.dto ';
import path from 'path';
import { createReadStream, statSync } from 'fs';
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
    // ss
    return await this.moviesService.getHeroMovie()
  }

  // @Get('watch/:filename')
  // async streamVideo(
  //   @Param('filename') filename: string,
  //   @Headers('range') range: string,
  //   @Res() res
  // ) {

  //   const videoPath = path.join(__dirname, '..', '..', 'downloads', filename);

  //   const { size } = statSync(videoPath);

  //   if (range) {
  //     const parts = range.replace(/bytes=/, "").split("-");
  //     const start = parseInt(parts[0], 10);
  //     const end = parts[1] ? parseInt(parts[1], 10) : size - 1;

  //     if (start >= size) {
  //       res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
  //         .header({
  //           'Content-Range': `bytes */${size}`,
  //         });
  //       return res.end();
  //     }

  //     const chunksize = (end - start) + 1;

  //     const file = createReadStream(videoPath, { start, end });

  //     const head = {
  //       'Content-Range': `bytes ${start}-${end}/${size}`,
  //       'Accept-Ranges': 'bytes',
  //       'Content-Length': chunksize,
  //       'Content-Type': 'video/mp4',
  //     };

  //     res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
  //     file.pipe(res);
  //   } else {
  //     const head = {
  //       'Content-Length': size,
  //       'Content-Type': 'video/mp4',
  //     };
  //     res.writeHead(HttpStatus.OK, head);
  //     createReadStream(videoPath).pipe(res);
  //   }
  // }

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
    return this.moviesService.updateProgress(req.user.id, imdbId, seconds, isLive);
  }

  @Get(':imdbId')
  async findOne(@Param('imdbId') imdbId: string) {
    return await this.moviesService.getMovieDetails(imdbId);
  }
}