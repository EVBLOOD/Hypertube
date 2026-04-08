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
  server: Server;

  constructor(private readonly commentService: CommentsService) {}

  handleConnection(client: Socket) {
    const movieId = client.handshake.query.movieId as string;
    if (movieId) {
      client.join(`movie_${movieId}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('postComment')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { movieId: string; content: string; userId: number },
  ) {
    const comment = await this.commentService.create(data.userId, data.movieId, data.content);
    
    this.server.to(`movie_${data.movieId}`).emit('newComment', comment);
  }
}