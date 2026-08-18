import {
    ExecutionContext,
    Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";


@Injectable()
export class WsJwtGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        const client: Socket = context.switchToWs().getClient();
        
        const rawToken =
            client.handshake.auth?.token ||
            client.handshake.headers?.authorization;


        const authorization = rawToken?.startsWith("Bearer ")
            ? rawToken
            : rawToken
            ? `Bearer ${rawToken}`
            : undefined;        

            return {
            headers: {
                authorization,
            },
        };
    }

    handleRequest<TUser = any>(
        err: any,
        user: TUser,
        info: any,
        context: ExecutionContext,
    ): TUser {
        if (err || !user) {
            throw err || new WsException("Unauthorized access");
        }

        const client: Socket = context.switchToWs().getClient();

        if (user && typeof user === "object" && "id" in user) {
            client.data.user = user.id;
            client.handshake.headers.userId = (user.id as number).toString();
        } else {
            console.log(user)
        }

        return user;
    }
}
