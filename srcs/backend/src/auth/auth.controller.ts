import { Controller, Post, Body, Get, Param, UseGuards, Req, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
// import { LocalStrategy } from './strategies/local.strategy';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WhitelistGuard } from './guards/whitelist.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const token = (await this.authService.login(req.user)).access_token
    res.cookie('AUTH_TOKEN', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      path: '/',
    });
    return { token, user: req.user };
  }

  @Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('whois')
  @UseGuards(JwtAuthGuard, WhitelistGuard)
  async whois(@Request() req) {
    console.log(req.user)
    return { user: req.user };
  }
}
