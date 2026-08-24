import {
    Controller,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
    Req,
    ParseIntPipe,
    Query,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WhitelistGuard } from "../auth/guards/whitelist.guard";
import { UsersService } from "./users.service";
import { PaginationFindUserDto } from "./dto/find-user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard, WhitelistGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Patch("me")
    async updateMe(@Req() req, @Body() dto: UpdateUserDto) {
        return this.userService.update(req.user.id, dto);
    }

    @Get("me/summary")
    async getMySummary(@Req() req) {
        return this.userService.getProfileSummary(req.user.id);
    }

    @Get("find/users")
    async findUsers(@Query() paging: PaginationFindUserDto, @Req() req) {
        return this.userService.findUsers(paging, req.user.id);
    }

    @Get(":id")
    async getProfile(@Param("id", ParseIntPipe) targetId: number, @Req() req) {
        return this.userService.findById(targetId, req.user.id);
    }
}
