import {
    forwardRef,
    Inject,
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

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(UserMovieProgress)
        private progressRepo: Repository<UserMovieProgress>,
        private readonly moviesService: MoviesService,
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

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException("User not found");

        Object.assign(user, dto);
        return this.userRepo.save(user);
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
