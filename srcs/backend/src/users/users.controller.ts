import { Controller, Get, Patch, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhitelistGuard } from '../auth/guards/whitelist.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, WhitelistGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  async getProfile(
    @Param('id', ParseIntPipe) targetId: number, 
    @Req() req
  ) {
    // Passes the requestor's ID to handle the privacy logic
    return this.userService.findById(targetId, req.user.id);
  }

  @Patch('me')
  async updateMe(@Req() req, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.id, dto);
  }
}