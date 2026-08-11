import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'comments' })
export class CommentsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly commentService: CommentsService) {}

  handleConnection(client: Socket) {
    const movieId = client.handshake.query.movieId as string;
    if (movieId) {
      client.join(`movie_${movieId}`);
    }
  }

  @SubscribeMessage('joinMovie')
  handleJoinMovie(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { movieId: string },
  ) {
    if (!data?.movieId) return { error: 'movieId required' };
    client.join(`movie_${data.movieId}`);
    return { ok: true };
  }

  @SubscribeMessage('leaveMovie')
  handleLeaveMovie(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { movieId: string },
  ) {
    if (!data?.movieId) return { error: 'movieId required' };
    client.leave(`movie_${data.movieId}`);
    return { ok: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('createComment')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { movieId: string; content: string },
  ) {
    const user = client.data.user;
    const comment = await this.commentService.create(user.id, data.movieId, data.content);

    this.server.to(`movie_${data.movieId}`).emit('newComment', comment);
    return comment;
  }
}