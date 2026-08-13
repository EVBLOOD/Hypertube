import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { UsersService } from "src/users/users.service";

@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client: Socket = context.switchToWs().getClient<Socket>();

            const authToken =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(" ")[1];

            if (!authToken) {
                throw new WsException("Unauthorized: No token provided");
            }

            const payload = this.jwtService.verify(authToken);

            const user = await this.userService.findById(
                payload.sub,
                payload.sub,
            );

            if (!user) {
                throw new WsException("Unauthorized: User not found");
            }

            client.data.user = user;

            return true;
        } catch (err: any) {
            this.logger.error(`WS Auth Error: ${err.message}`);
            throw new WsException("Invalid credentials");
        }
    }
}
