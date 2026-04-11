import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors(
        [
          (request: Request) => {
            return request?.cookies?.AUTH_TOKEN
          }
        ]
      ),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "I'm the secret",
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub, payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}