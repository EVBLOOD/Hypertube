import { forwardRef, Inject, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsJwtGuard } from "src/auth/guards/ws-jwt.guard";
import { RedisService } from "src/common/redis/redis.service";
import { MoviesService } from "./movies.service";

@UseGuards(WsJwtGuard)
@WebSocketGateway({ namespace: "movie", cors: { origin: "*" } })
export class MovieGateway {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => MoviesService))
        private readonly moviesService: MoviesService,

        // private readonly redisService: RedisService,
    ) {}

    @WebSocketServer()
    server!: Server;

    private readonly connectedPlayers: Map<string, Socket[]> = new Map();
    private readonly roomsMembers: Map<string, string[]> = new Map();
    private readonly JoinedRooms: Map<string, Map<string, Socket>> = new Map();

    handleConnection(socket: Socket) {
        try {
            const authorization =
                socket.handshake.headers.authorization?.split(" ")[1];
            const payload = this.jwtService.verify(authorization || "");

            socket.join(`user:${payload.sub}`);
            this.connectedPlayers.set(payload.sub, [
                ...(this.connectedPlayers.get(payload.sub) || []),
                socket,
            ]);
        } catch (err) {
            console.log(err);
            socket.disconnect();
            return;
        }
    }

    notifyHostInviteAccepted(hostId: string, roomId: string, guestId: string) {
        this.server
            .to(`user:${hostId}`)
            .emit("INVITE_ACCEPTED", { roomId, guestId });
        this.roomsMembers.set(roomId, [hostId, guestId]);
    }

    @SubscribeMessage("join_room")
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];

        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            const JoinedRoom =
                this.JoinedRooms.get(data.roomId) || new Map<string, Socket>();

            const socket = JoinedRoom.get(userId);
            if (!socket) {
                JoinedRoom.set(userId, client);
            } else if (socket.id !== client.id) {
                socket.disconnect();
                JoinedRoom.set(userId, client);
            }

            this.JoinedRooms.set(data.roomId, JoinedRoom);

            client.join(data.roomId);
            console.log(`User ${userId} joined room ${data.roomId}`);

            const JoinedRoomUpdated =
                this.JoinedRooms.get(data.roomId) || new Map<string, Socket>();
            if (JoinedRoomUpdated.size === 2) {
                JoinedRoomUpdated.forEach((socket, _) => {
                    socket.emit("USER_JOINED", { roomId: data.roomId });
                });
            }
        }
    }

    @SubscribeMessage("send_message")
    handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: { roomId: string; content: string; movieId: string },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];
        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            const JoinedRoom = this.JoinedRooms.get(data.roomId);
            const socket = JoinedRoom?.get(userId != hostId ? hostId : guestId);
            if (socket) {
                console.log(
                    `User ${userId} sent message to room ${data.roomId}: ${data.content}`,
                );
                socket.emit("MESSAGE", {
                    content: data.content,
                    sender: userId,
                });
            }
        }
    }

    @SubscribeMessage("leave_room")
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];
        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            client.leave(data.roomId);
            console.log(`User ${userId} left room ${data.roomId}`);
        }
    }

    @SubscribeMessage("start_stream")
    handleStartStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];
        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            const JoinedRoom = this.JoinedRooms.get(data.roomId);
            const socket = JoinedRoom?.get(userId != hostId ? hostId : guestId);
            if (socket) {
                console.log(
                    `User ${userId} started stream in room ${data.roomId}`,
                );
                socket.emit("START_STREAM", { roomId: data.roomId });
            }
        }
    }

    @SubscribeMessage("pause_stream")
    handlePauseStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];
        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            const JoinedRoom = this.JoinedRooms.get(data.roomId);
            const socket = JoinedRoom?.get(userId != hostId ? hostId : guestId);
            if (socket) {
                console.log(
                    `User ${userId} paused stream in room ${data.roomId}`,
                );
                socket.emit("PAUSE_STREAM", { roomId: data.roomId });
            }
        }
    }

    @SubscribeMessage("seek_stream")
    handleSeekStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; time: number },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];
        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            const JoinedRoom = this.JoinedRooms.get(data.roomId);
            const socket = JoinedRoom?.get(userId != hostId ? hostId : guestId);
            if (socket) {
                console.log(
                    `User ${userId} seeked stream to ${data.time} in room ${data.roomId}`,
                );
                socket.emit("SEEK_STREAM", {
                    roomId: data.roomId,
                    time: data.time,
                });
            }
        }
    }

    @SubscribeMessage("play")
    async handlePlayMovie(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { currentTime: number; imdbId: string },
    ) {
        const userId = client.handshake.headers.userId;
        if (!userId || typeof userId !== "string") {
            console.error("User ID not found in socket handshake headers.");
            return;
        }

        await this.moviesService.markMovieCurrentTime(
            userId,
            data.currentTime,
            data.imdbId,
        );
    }

    @SubscribeMessage("pause")
    async handlePauseMovie(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { currentTime: number; imdbId: string },
    ) {
        const userId = client.handshake.headers.userId;
        if (!userId || typeof userId !== "string") {
            console.error("User ID not found in socket handshake headers.");
            return;
        }

        await this.moviesService.markMovieCurrentTime(
            userId,
            data.currentTime,
            data.imdbId,
        );
    }

    @SubscribeMessage("heartbeat")
    async handleHeartbeat(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { currentTime: number; imdbId: string },
    ) {
        const userId = client.handshake.headers.userId;
        if (!userId || typeof userId !== "string") {
            console.error("User ID not found in socket handshake headers.");
            return;
        }

        await this.moviesService.markMovieCurrentTime(
            userId,
            data.currentTime,
            data.imdbId,
        );
    }

    @SubscribeMessage("seeking")
    async handleSeeking(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { currentTime: number; imdbId: string },
    ) {
        const userId = client.handshake.headers.userId;
        if (!userId || typeof userId !== "string") {
            console.error("User ID not found in socket handshake headers.");
            return;
        }

        await this.moviesService.markMovieCurrentTime(
            userId,
            data.currentTime,
            data.imdbId,
        );
    }

    @SubscribeMessage("abort_stream")
    handleAbortStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        const [hostId, guestId] = this.roomsMembers.get(data.roomId) || [];
        const userId = client.handshake.headers.userId;

        if (hostId == userId || guestId == userId) {
            const JoinedRoom = this.JoinedRooms.get(data.roomId);
            const socket = JoinedRoom?.get(userId != hostId ? hostId : guestId);
            if (socket) {
                console.log(
                    `User ${userId} aborted stream in room ${data.roomId}`,
                );
                socket.emit("ABORT_STREAM", { roomId: data.roomId });
                this.JoinedRooms.delete(data.roomId);
                this.roomsMembers.delete(data.roomId);
            }
        }
    }
}
