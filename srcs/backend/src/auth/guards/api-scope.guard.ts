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
export class ApiScopeGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader: string | undefined = request.headers?.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new UnauthorizedException(
                "This endpoint requires an OAuth Bearer token. " +
                "Obtain one via POST /oauth/token with your client credentials.",
            );
        }

        const token = authHeader.substring(7);

        let payload: any;
        try {
            payload = this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException("Invalid or expired OAuth token.");
        }

        if (payload?.scope !== "api") {
            throw new ForbiddenException(
                "This endpoint is only accessible with an OAuth API token " +
                "(scope=api). Regular session tokens are not accepted here.",
            );
        }

        const storedToken = await this.redisService.get(`session:${payload.sub}`);
        if (storedToken !== token) {
            throw new UnauthorizedException("OAuth token has been revoked or expired.");
        }

        request.user = { id: payload.sub, username: payload.username };

        return true;
    }
}
