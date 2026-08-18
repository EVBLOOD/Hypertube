import {
    Injectable,
    NotFoundException,
} from "@nestjs/common";
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

        const user = await this.userRepo.findOne({ where: { id } });
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

        actions.push("updated successfully");
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
}
