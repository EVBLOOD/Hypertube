import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        const client: Socket = context.switchToWs().getClient();

        const rawToken =
            client.handshake?.auth?.token ||
            client.handshake?.headers?.authorization;

        const tokenStr = typeof rawToken === "string" ? rawToken.trim() : undefined;
        const authorization = tokenStr?.startsWith("Bearer ")
            ? tokenStr
            : tokenStr
              ? `Bearer ${tokenStr}`
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
            client.data = client.data || {};
            client.data.user = (user as any).id;
            if (client.handshake) {
                client.handshake.headers = client.handshake.headers || {};
                client.handshake.headers.userId = String((user as any).id);
            }
        }

        return user;
    }
}
