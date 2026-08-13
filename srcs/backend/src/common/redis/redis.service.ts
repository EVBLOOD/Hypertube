import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
import { start } from "repl";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;
    private readonly logger = new Logger(RedisService.name);

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || "redis://redis:6379",
        });

        this.client.on("error", (err) =>
            this.logger.error("Redis Client Error", err),
        );
    }

    async onModuleInit() {
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.destroy();
    }

    async set(key: string, value: string, time: number) {
        await this.client.set(key, value, {
            EX: time,
        });
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async del(key: string) {
        await this.client.del(key);
    }

    async len(key: string) {
        return await this.client.lLen(key);
    }

    // async pushMovies(key: string, ...value: string[]) {
    //   await this.client.rPush(key, value);
    //   await this.client.expire(key, 6000);
    // }

    // async getMovies(key: string, skip: number, limit: number) {
    //   const start = skip;
    //   const stop = skip + limit - 1;
    //   return await this.client.lRange(key, start, stop);
    // }

    async pushMovies(key: string, movies: any[]) {
        const pipeline = this.client.multi();

        let scoreBase = await this.client.incr(`${key}:counter`);
        for (const movie of movies) {
            const id = movie.id;
            pipeline.set(`movie:${id}`, JSON.stringify(movie), { EX: 86400 });
            pipeline.zAdd(key, {
                score: scoreBase++,
                value: String(id),
            });
        }
        await pipeline.exec();
        await this.client.expire(key, 86400);
        await this.client.expire(`${key}:counter`, 86400);
    }

    async getMovies(key: string, start: number, size: number) {
        const ids = await this.client.zRange(key, start, start + size - 1);

        if (!ids.length) return [];

        const pipeline = this.client.multi();
        for (const id of ids) {
            pipeline.get(`movie:${id}`);
        }

        const results = await pipeline.exec();
        if (!results) return [];
        return results.map((r: any) => {
            return JSON.parse(r as string);
        });
    }

    async lenZSet(key: string) {
        return this.client.ZCARD(key);
    }
}
