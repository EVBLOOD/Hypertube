import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from "@nestjs/common";
import { RedisService } from "src/common/redis/redis.service";

@Injectable()
export class WhitelistGuard implements CanActivate {
    constructor(private redisService: RedisService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers?.authorization;
        const bearerToken =
            typeof authHeader === "string" && authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : undefined;
        const token = request.cookies?.AUTH_TOKEN || bearerToken;

        const user = request.user;

        if (!user || !token) throw new UnauthorizedException();

        const whitelistedToken = await this.redisService.get(
            `session:${user.id}`,
        );
        if (whitelistedToken !== token) {
            throw new UnauthorizedException("Session revoked or expired.");
        }
        return true;
    }
}
