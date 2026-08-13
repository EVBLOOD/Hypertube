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
        const token = request.cookies?.AUTH_TOKEN;
        // const token = request.headers.authorization?.split(' ')[1];

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
