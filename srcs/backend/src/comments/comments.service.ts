import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "./entities/comment.entity";
import { MoviesService } from "src/movies/movies.service";
import { PaginationCommentDto } from "./dto/pagination-comments.dto ";
import { CommentCommentInteraction } from "./entities/user-comment.entity";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        @InjectRepository(CommentCommentInteraction)
        private interactionRepo: Repository<CommentCommentInteraction>,
        private readonly movieService: MoviesService,
    ) { }

    async create(userId: number, imdbId: string, content: string) {
        let movie = await this.movieService.findByImdbId(imdbId);
        if (!movie) {
            movie = await this.movieService.saveMoviebyImdbId(imdbId);
            if (!movie) {
                throw new NotFoundException(
                    `Movie with IMDb ID ${imdbId} not found and could not be created.`,
                );
            }
        }

        const sanitizedContent = sanitizeHtml(content || "", {
            allowedTags: [],
            allowedAttributes: {},
        }).trim();

        if (!sanitizedContent) {
            throw new BadRequestException("Comment cannot be empty");
        }

        const comment = this.commentRepo.create({
            content: sanitizedContent,
            user: { id: userId },
            movie: { id: movie.id },
        });

        const saved = await this.commentRepo.save(comment);
        if (userId) {
            await this.movieService.addToHistory(
                userId,
                movie.id,
                "comment_created",
            );
        }

        return this.commentRepo.findOne({
            where: { id: saved.id },
            relations: ["user"],
        });
    }

    async findByMovie(
        imdbId: string,
        paging: PaginationCommentDto,
        userId: number,
    ) {
        const { page = 1, limit = 20, sort = "createdAt" } = paging;
        const safeSort =
            sort === "interactionCount"
                ? "comment.userReaction"
                : "comment.createdAt";

        const query = this.commentRepo
            .createQueryBuilder("comment")
            .leftJoinAndSelect("comment.user", "user")
            .leftJoin("comment.movie", "movie")
            .where("movie.imdbId = :imdbId", { imdbId })
            .orderBy(safeSort, "DESC")
            .skip((page - 1) * limit)
            .take(limit);

        if (userId !== -1) {
            query.leftJoinAndSelect(
                "comment.commentCommentInteractions",
                "userInteraction",
                "userInteraction.userId = :userId",
                { userId },
            );
        }

        const comments = await query.getMany();

        return comments.map((comment) => {
            const interaction = comment.commentCommentInteractions?.[0];
            const userReaction =
                userId !== -1 && interaction ? interaction.interaction : 0;

            return {
                ...comment,
                userReaction,
            };
        });
    }

    async addInteraction(
        commentId: number,
        interaction: number,
        userId: number,
    ) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
        });

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${commentId} not found.`);
        }
        if (interaction !== 1 && interaction !== 2) {
            throw new BadRequestException(
                `Invalid interaction value: ${interaction}. Must be 1 (like) or 2 (dislike).`,
            );
        }

        let interactionToAdd = interaction;
        const existingInteraction = await this.interactionRepo.findOne({
            where: { comment: { id: commentId }, user: { id: userId } },
        });

        console.log("Existing interaction:", existingInteraction);
        console.log("Posted interaction:", interaction);

        if (existingInteraction?.interaction === interaction) {
            interactionToAdd = 0;
            comment.userReaction +=
                interaction === 2 ? +1 : interaction === 1 ? -1 : 0;
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

    async getLatestComments(limit = 50) {
        const comments = await this.commentRepo.find({
            relations: ["user", "movie"],
            order: { createdAt: "DESC" },
            take: limit,
        });

        return comments.map((c) => ({
            id: c.id,
            comment_id: c.id,
            content: c.content,
            comment: c.content,
            author: c.user?.username || "Anonymous",
            username: c.user?.username || "Anonymous",
            date: c.createdAt,
            date_posted: c.createdAt,
            movie_id: c.movie?.imdbId,
            likeCount: c.likeCount,
            dislikeCount: c.dislikeCount,
        }));
    }

    async getCommentById(id: number) {
        const comment = await this.commentRepo.findOne({
            where: { id },
            relations: ["user", "movie"],
        });

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${id} not found.`);
        }

        return {
            id: comment.id,
            comment_id: comment.id,
            content: comment.content,
            comment: comment.content,
            author: comment.user?.username || "Anonymous",
            username: comment.user?.username || "Anonymous",
            date: comment.createdAt,
            date_posted: comment.createdAt,
            movie_id: comment.movie?.imdbId,
            likeCount: comment.likeCount,
            dislikeCount: comment.dislikeCount,
        };
    }

    async updateComment(
        id: number,
        content: string,
        userId?: number,
        username?: string,
    ) {
        const comment = await this.commentRepo.findOne({
            where: { id },
            relations: ["user", "movie"],
        });

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${id} not found.`);
        }

        if (userId && comment.user.id !== userId) {
            throw new BadRequestException(
                `User with ID ${userId} is not authorized to update this comment.`,
            );
        }

        const sanitizedContent = sanitizeHtml(content || "", {
            allowedTags: [],
            allowedAttributes: {},
        }).trim();

        if (!sanitizedContent) {
            throw new BadRequestException("Comment cannot be empty");
        }

        comment.content = sanitizedContent;
        await this.commentRepo.save(comment);
        if (userId) {
            await this.movieService.addToHistory(
                userId,
                comment.movie.id,
                "comment_updated",
            );
        }

        return {
            id: comment.id,
            comment_id: comment.id,
            content: comment.content,
            comment: comment.content,
            author: comment.user?.username || username || "Anonymous",
            username: comment.user?.username || username || "Anonymous",
            date: comment.createdAt,
            date_posted: comment.createdAt,
            movie_id: comment.movie?.imdbId,
            message: "Comment updated successfully",
        };
    }

    async deleteComment(id: number, userId?: number) {
        const comment = await this.commentRepo.findOne({
            where: { id },
            relations: ["user", "movie"],
        });

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${id} not found.`);
        }
        if (userId && comment.user.id !== userId) {
            throw new BadRequestException(
                `User with ID ${userId} is not authorized to delete this comment.`,
            );
        }

        await this.commentRepo.remove(comment);
        if (userId) {
            await this.movieService.addToHistory(
                userId,
                comment.movie.id,
                "comment_deleted",
            );
        }

        return {
            message: "Comment deleted successfully",
            id,
        };
    }
}
