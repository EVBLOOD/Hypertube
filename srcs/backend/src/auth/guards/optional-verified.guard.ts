import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

@Injectable()
export class OptionalVerifiedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.isVerified) {
            return true;
        }
        return true;
    }
}
