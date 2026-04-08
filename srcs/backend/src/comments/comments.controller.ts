import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
}