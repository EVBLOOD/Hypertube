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
    Put,
    Post,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    NotFoundException,
    Res,
    StreamableFile,
    BadRequestException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WhitelistGuard } from "../auth/guards/whitelist.guard";
import { UsersService } from "./users.service";
import { ApiDoc } from "../docs/decorators/api-doc.decorator";
import { PaginationFindUserDto } from "./dto/find-user.dto";
import { extname, join, basename, resolve } from "path";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage, memoryStorage } from "multer";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { get } from "axios";
import fsPromises from "fs/promises";

@Controller("users")
@UseGuards(JwtAuthGuard, WhitelistGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    @ApiDoc({ target: "users.getAllUsers" })
    async getAllUsers() {
        const users = await this.userService.findAll();
        return users.map((u) => ({
            id: u.id,
            username: u.username,
        }));
    }

    @Patch("me")
    @ApiDoc({ target: "users.updateMe" })
    async updateMe(@Req() req, @Body() dto: UpdateUserDto) {
        return this.userService.update(req.user.id, dto);
    }

    @Get("me/summary")
    @ApiDoc({ target: "users.getMySummary" })
    async getMySummary(@Req() req) {
        return this.userService.getProfileSummary(req.user.id);
    }

    @Get("find/users")
    @ApiDoc({ target: "users.findUsers" })
    async findUsers(@Query() paging: PaginationFindUserDto, @Req() req) {
        return this.userService.findUsers(paging, req.user.id);
    }

    @Post("avatar_update")
    @ApiDoc({ target: "users.uploadImage" })
    @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
    uploadImage(
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

        this.userService.updateAvatar(req.user.id, filename);

        return {
            message: "Image uploaded successfully",
            filename: filename,
        };
    }

    @Get("avatar/:filename")
    @ApiDoc({ target: "users.getAvatar" })
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

        return new StreamableFile(fileStream, {
            type: contentType,
        });
    }

    @Get(":id")
    @ApiDoc({ target: "users.getProfile" })
    async getProfile(@Param("id", ParseIntPipe) targetId: number, @Req() req) {
    //     return this.userService.findById(targetId, req.user.id);
    // async getProfile(@Param("id", ParseIntPipe) targetId: number) {
        return this.userService.findUserForApi(targetId);
    }

    @Patch(":id")
    async updateProfile(
        @Param("id", ParseIntPipe) targetId: number,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.updateForApi(targetId, dto);
    }
}
