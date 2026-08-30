import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "src/common/redis/redis.service";

@Injectable()
export class WhitelistGuard implements CanActivate {
    constructor(
        private readonly redisService: RedisService,
        private readonly jwtService: JwtService,
    ) {}

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
        try {
            const payload: any = this.jwtService.decode(token);
            if (payload?.scope === "api") {
                throw new ForbiddenException(
                    "OAuth API tokens cannot be used for application routes. " +
                    "Use a session token (login via the app) instead.",
                );
            }
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
        }

        const whitelistedToken = await this.redisService.get(
            `session:${user.id}`,
        );
        if (whitelistedToken !== token) {
            throw new UnauthorizedException("Session revoked or expired.");
        }
        return true;
    }
}
