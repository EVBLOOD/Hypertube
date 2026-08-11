import { Controller, Get, Param, UseGuards, Post, Body, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Get(':imdbId')
  async getMovieComments(@Param('imdbId') imdbId: string) {
    return this.commentService.findByMovie(imdbId);
  }

  @Post(':imdbId')
  async createMovieComment(
    @Param('imdbId') imdbId: string,
    @Body('content') content: string,
    @Req() req,
  ) {
    const userId = req.user?.id || 1;
    return this.commentService.create(userId, imdbId, content);
  }
}