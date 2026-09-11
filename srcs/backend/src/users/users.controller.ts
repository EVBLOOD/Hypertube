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
    Post,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    NotFoundException,
    StreamableFile,
    BadRequestException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WhitelistGuard } from "../auth/guards/whitelist.guard";
import { ApiScopeGuard } from "../auth/guards/api-scope.guard";
import { UsersService } from "./users.service";
import { ApiDoc } from "../docs/decorators/api-doc.decorator";
import { PaginationFindUserDto } from "./dto/find-user.dto";
import { extname, join, basename, resolve } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "fs";

@Controller("users")
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @ApiDoc({ target: "users.getAllUsers" })
    @UseGuards(ApiScopeGuard)
    @Get()
    async getAllUsers() {
        const users = await this.userService.findAll();
        return users.map((u) => ({
            id: u.id,
            username: u.username,
        }));
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Patch("me")
    async updateMe(@Req() req, @Body() dto: UpdateUserDto) {
        return this.userService.update(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Get("me/summary")
    async getMySummary(@Req() req) {
        return this.userService.getProfileSummary(req.user.id, req.user.id);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Get(":id/summary")
    async getSummaryById (@Param("id", ParseIntPipe) id: number, @Req() req) {
        return this.userService.getProfileSummary(id, req.user?.id);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Get("me/continue-watching")
    async getContinueWatching(@Req() req) {
        return this.userService.getContinueWatching(req.user.id);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Get("find/users")
    async findUsers(@Query() paging: PaginationFindUserDto, @Req() req) {
        return this.userService.findUsers(paging, req.user.id);
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Post("avatar_update")
    @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 5 * 1024 * 1024,
                    }),
                    new FileTypeValidator({
                        fileType: /^image\/(jpeg|jpg|png)$/,
                        skipMagicNumbersValidation: true,
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Req() req,
    ) {
        const uploadedFile = file;
        if (!uploadedFile) {
            throw new BadRequestException("No file uploaded");
        }
        const uploadDir = join(process.cwd(), "uploads");
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname).toLowerCase();
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        const filePath = join(uploadDir, filename);

        writeFileSync(filePath, file.buffer);

        await this.userService.updateAvatar(req.user.id, filename);

        return {
            message: "Image uploaded successfully",
            filename: filename,
        };
    }

    @UseGuards(JwtAuthGuard, WhitelistGuard)
    @Get("avatar/:filename")
    async getAvatar(@Param("filename") filename: string) {
        const safeFilename = basename(filename);
        const uploadDir = resolve(process.cwd(), "uploads");
        const filePath = resolve(uploadDir, safeFilename);

        if (!filePath.startsWith(uploadDir) || !existsSync(filePath)) {
            throw new NotFoundException("Avatar not found");
        }

        const ext = extname(safeFilename).toLowerCase();
        const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
        };

        const contentType = mimeTypes[ext] || "application/octet-stream";
        const fileStream = createReadStream(filePath);
        fileStream.on("error", () => {});

        return new StreamableFile(fileStream, {
            type: contentType,
        });
    }

    @ApiDoc({ target: "users.getProfile" })
    @UseGuards(ApiScopeGuard)
    @Get(":id")
    async getProfile(@Param("id", ParseIntPipe) targetId: number) {
        return this.userService.findUserForApi(targetId);
    }

    @ApiDoc({ target: "users.updateProfile" })
    @UseGuards(ApiScopeGuard)
    @Patch(":id")
    async updateProfile(
        @Param("id", ParseIntPipe) targetId: number,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.updateForApi(targetId, dto);
    }
}
