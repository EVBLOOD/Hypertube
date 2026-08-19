import {
    Controller,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
    Req,
    ParseIntPipe,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WhitelistGuard } from "../auth/guards/whitelist.guard";
import { UsersService } from "./users.service";
import { ApiDoc } from "../docs/decorators/api-doc.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, WhitelistGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    @ApiDoc({
        summary: "Get all users",
        description: "Returns a list of all users",
    })
    async getAllUsers() {
        return this.userService.findAll();
    }

    @Get(":id")
    async getProfile(@Param("id", ParseIntPipe) targetId: number, @Req() req) {
        return this.userService.findById(targetId, req.user.id);
    }

    @Patch("me")
    async updateMe(@Req() req, @Body() dto: UpdateUserDto) {
        return this.userService.update(req.user.id, dto);
    }

    @Get("me/summary")
    async getMySummary(@Req() req) {
        return this.userService.getProfileSummary(req.user.id);
    }
}
