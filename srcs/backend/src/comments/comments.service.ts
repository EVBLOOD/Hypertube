import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { MoviesService } from "src/movies/movies.service";
import { PaginationCommentDto } from "./dto/pagination-comments.dto ";
import { CommentCommentInteraction } from "./entities/user-comment.entity";

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(CommentCommentInteraction) private interactionRepo: Repository<CommentCommentInteraction>,
        private readonly movieService: MoviesService,
    ) { }

    async create(userId: number, imdbId: string, content: string) {
        let movie = await this.movieService.findByImdbId(imdbId);
        if (!movie) {
            movie = await this.movieService.saveMoviebyImdbId(imdbId);
            if (!movie) {
                throw new Error(
                    `Movie with IMDb ID ${imdbId} not found and could not be created.`,
                );
            }
        }
        const comment = this.commentRepo.create({
            content,
            user: { id: userId },
            movie: { id: movie.id },
        });

        const saved = await this.commentRepo.save(comment);

        return this.commentRepo.findOne({
            where: { id: saved.id },
            relations: ["user"],
        });
    }

    async findByMovie(imdbId: string, paging: PaginationCommentDto, userId: number) {
        const { page = 1, limit = 20, sort = "createdAt" } = paging;

        const query = this.commentRepo
            .createQueryBuilder("comment")
            .leftJoinAndSelect("comment.user", "user")
            .leftJoin("comment.movie", "movie")
            .where("movie.imdbId = :imdbId", { imdbId })
            .orderBy(
                sort === "interactionCount" ? "comment.userReaction" : `comment.${sort}`,
                "DESC"
            )
            .skip((page - 1) * limit)
            .take(limit);

        if (userId !== -1) {
            query.leftJoinAndSelect(
                "comment.commentCommentInteractions",
                "userInteraction",
                "userInteraction.userId = :userId",
                { userId }
            );
        }

        const comments = await query.getMany();

        return comments.map((comment) => {
            const interaction = comment.commentCommentInteractions?.[0];
            const userReaction = userId !== -1 && interaction ? interaction.interaction : 0;

            return {
                ...comment,
                userReaction,
            };
        });
    }

    async addInteraction(commentId: number, interaction: number, userId: number) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
        });

        if (!comment) {
            throw new Error(`Comment with ID ${commentId} not found.`);
        }
        if (interaction !== 1 && interaction !== 2) {
            throw new Error(`Invalid interaction value: ${interaction}. Must be 1 or 2.`);
        }

        let interactionToAdd = interaction;
        const existingInteraction = await this.interactionRepo.findOne({
            where: { comment: { id: commentId }, user: { id: userId } },
        });

        console.log("Existing interaction:", existingInteraction);
        console.log("Posted interaction:", interaction);

        if (existingInteraction?.interaction === interaction) {
            interactionToAdd = 0;
            comment.userReaction += interaction === 2 ? +1 : interaction === 1 ? -1 : 0;

        } else {
            comment.userReaction = interaction === 2 ? -1 : 1;
        }

        if (interactionToAdd === 1) {
            comment.likeCount += 1;
            if (existingInteraction?.interaction === 2) {
                comment.dislikeCount -= 1;
            }
        } else if (interactionToAdd === 2) {
            comment.dislikeCount += 1;
            if (existingInteraction?.interaction === 1) {
                comment.likeCount -= 1;
            }
        } else {
            if (existingInteraction?.interaction === 1) {
                comment.likeCount -= 1;
            } else if (existingInteraction?.interaction === 2) {
                comment.dislikeCount -= 1;
            }
        }
        await this.commentRepo.save(comment);

        if (existingInteraction) {
            existingInteraction.interaction = interactionToAdd;
            await this.interactionRepo.save(existingInteraction);
        } else {
            const newInteraction = this.interactionRepo.create({
                interaction: interactionToAdd,
                user: { id: userId },
                comment: { id: comment.id },
            });
            await this.interactionRepo.save(newInteraction);
        }

        return comment;
    }
}
