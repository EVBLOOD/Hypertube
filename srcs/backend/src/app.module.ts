import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { dataSourceOptions } from "./config/typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { MoviesModule } from "./movies/movies.module";
import { CommentsModule } from "./comments/comments.module";
import { MailModule } from "./mails/mails.module";
import { RedisModule } from "./common/redis/redis.module";
import { BullModule } from "@nestjs/bull";
import { StreamsModule } from "./streams/streams.module";
import { DocsModule } from "./docs/docs.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                ...dataSourceOptions,
                entities: [],
                migrations: [],
                autoLoadEntities: true,
            }),
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>("REDIS_HOST", "redis"),
                    port: parseInt(configService.get<string>("REDIS_PORT", "6379"), 10),
                },
            }),
        }),
        UsersModule,
        AuthModule,
        MoviesModule,
        CommentsModule,
        MailModule,
        RedisModule,
        StreamsModule,
        DocsModule,
    ],
})
export class AppModule {}
