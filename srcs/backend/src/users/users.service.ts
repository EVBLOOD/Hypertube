import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
    UserMovieProgress,
    UserInteraction,
} from "src/movies/entities/user-movie-progress.entity";
import { MoviesService } from "src/movies/movies.service";
import { RedisService } from "src/common/redis/redis.service";
import { MailsService } from "src/mails/mails.service";
import { v4 as uuidv4 } from "uuid";
import { PaginationFindUserDto } from "./dto/find-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(UserMovieProgress)
        private progressRepo: Repository<UserMovieProgress>,
        private readonly moviesService: MoviesService,
        private readonly redisService: RedisService,
        private readonly emailsService: MailsService,
    ) {}

    async findById(id: number, requestorId: number): Promise<User> {
        const query = this.userRepo
            .createQueryBuilder("user")
            .where("user.id = :id", { id });

        if (id === requestorId) {
            query.addSelect("user.email");
        } else {
            query.andWhere("user.privacy = :privacy", { privacy: "public" });
        }

        const user = await query.getOne();
        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    findbyEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }
    private hasChanged<T extends Record<string, any>>(
        patch: Partial<T>,
        original: T,
    ): boolean {
        return Object.keys(patch).some((key) => patch[key] !== original[key]);
    }
    async update(
        id: number,
        dto: UpdateUserDto,
    ): Promise<{ user: User; actions: string[] }> {
        let tmpDto: UpdateUserDto = { ...dto };
        const actions: string[] = [];

        let user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException("User not found");
        if (dto.email && dto.email !== user.email) {
            const existingUser = await this.userRepo.findOne({
                where: { email: dto.email },
            });
            if (existingUser) {
                throw new NotFoundException("Email already in use");
            }
            const verificationToken = uuidv4();
            this.redisService.set(
                `emailChangeToken:${user.id}`,
                JSON.stringify({ token: verificationToken, email: dto.email }),
                3600,
            );

            this.emailsService.sendEmailChangeVerification(
                user,
                verificationToken,
            );
            actions.push("check your email to complete email change");
            const { email, ...lol } = tmpDto;
            tmpDto = { ...lol };
        }
        if (dto.username && dto.username !== user.username) {
            const existingUser = await this.userRepo.findOne({
                where: { username: dto.username },
            });
            if (existingUser) {
                throw new NotFoundException("Username already in use");
            }
        }

        if (dto.password && dto.password !== user.password) {
            const verificationToken = uuidv4();
            this.redisService.set(
                `passwordChange:${user.id}`,
                JSON.stringify({
                    token: verificationToken,
                    password: dto.password,
                }),
                3600,
            );

            this.emailsService.sendPasswordChangeVerification(
                user,
                verificationToken,
            );
            actions.push("check your email to complete password change");

            const { password, ...lol } = tmpDto;
            tmpDto = { ...lol };
        }

        if (tmpDto.password) {
            delete tmpDto.password;
        }

        user = Object.assign(user, tmpDto);

        return { user: await this.userRepo.save(user), actions: actions };
    }

    async findAll(): Promise<User[]> {
        return this.userRepo.find();
    }

    async getProfileSummary(userId: number) {
        const user = await this.findById(userId, userId);

        const progress = await this.progressRepo.find({
            where: { user: { id: userId } },
            relations: ["movie"],
            order: { updatedAt: "DESC" },
            take: 8,
        });

        const stats = {
            watched: progress.filter((item) => item.isWatched).length,
            wishlisted: progress.filter((item) => item.isWishlisted).length,
            liked: progress.filter(
                (item) => item.likedOrDisliked === UserInteraction.LIKED,
            ).length,
            disliked: progress.filter(
                (item) => item.likedOrDisliked === UserInteraction.DISLIKED,
            ).length,
            totalInteractions: progress.length,
        };

        const history = await this.moviesService.getHistory(userId);

        return {
            user,
            stats,
            history: history,
        };
    }

    async findUsers(paging: PaginationFindUserDto, requestorId: number) {
        console.log(
            "findUsers called with paging:",
            paging,
            "requestorId:",
            requestorId,
        );
        const { page = 1, limit = 20, username } = paging;
        const query = this.userRepo
            .createQueryBuilder("user")
            .select([
                "user.id",
                "user.username",
                "user.firstName",
                "user.lastName",
                "user.profilePicture",
            ])
            .where("user.username LIKE :username", {
                username: `%${username}%`,
            })
            .andWhere("user.id != :requestorId", { requestorId })
            .andWhere("user.privacy = :privacy", { privacy: "public" })
            .orderBy("user.username", "ASC")
            .skip((page - 1) * limit)
            .take(limit);

        const [users, total] = await query.getManyAndCount();

        return {
            data: users,
            metadata: {
                nextPage: page + 1,
                hasMore: total > page * limit,
            },
        };
    }

    async updateAvatar(userId: number, path: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("User not found");

        user.profilePicture = path;
        await this.userRepo.save(user);

        return { message: "Profile picture updated successfully" };
    }

    async findUserForApi(id: number) {
        const user = await this.userRepo.findOne({
            where: { id },
            select: [
                "id",
                "username",
                "email",
                "profilePicture",
                "firstName",
                "lastName",
            ],
        });
        if (!user) throw new NotFoundException("User not found");

        const avatarUrl = user.profilePicture
            ? user.profilePicture.startsWith("http")
                ? user.profilePicture
                : `/users/avatar/${user.profilePicture}`
            : null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            email_address: user.email,
            profile_picture_url: avatarUrl,
            profilePicture: user.profilePicture,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }

    async updateForApi(id: number, dto: UpdateUserDto) {
        const user = await this.userRepo.findOne({
            where: { id },
            select: [
                "id",
                "username",
                "email",
                "password",
                "profilePicture",
                "firstName",
                "lastName",
            ],
        });
        if (!user) throw new NotFoundException("User not found");

        if (dto.email && dto.email !== user.email) {
            const existing = await this.userRepo.findOne({
                where: { email: dto.email },
            });
            if (existing && existing.id !== id) {
                throw new BadRequestException("Email already in use");
            }
            user.email = dto.email;
        }

        if (dto.username && dto.username !== user.username) {
            const existing = await this.userRepo.findOne({
                where: { username: dto.username },
            });
            if (existing && existing.id !== id) {
                throw new BadRequestException("Username already in use");
            }
            user.username = dto.username;
        }

        const pic =
            dto.profilePicture ||
            dto.profile_picture_url ||
            dto.profilePictureUrl;
        if (pic !== undefined) {
            user.profilePicture = pic;
        }

        if (dto.firstName) user.firstName = dto.firstName;
        if (dto.lastName) user.lastName = dto.lastName;

        if (dto.password) {
            user.password = dto.password;
        }

        await this.userRepo.save(user);

        const avatarUrl = user.profilePicture
            ? user.profilePicture.startsWith("http")
                ? user.profilePicture
                : `/users/avatar/${user.profilePicture}`
            : null;

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            email_address: user.email,
            profile_picture_url: avatarUrl,
            profilePicture: user.profilePicture,
            firstName: user.firstName,
            lastName: user.lastName,
            message: "Profile updated successfully",
        };
    }
}
