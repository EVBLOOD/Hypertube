import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './config/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { CommentsModule } from './comments/comments.module';
import { MailModule } from './mails/mails.module';
import { RedisModule } from './common/redis/redis.module';
import { BullModule } from '@nestjs/bull';
import { StreamsModule } from './streams/streams.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "123"),
      },
    }),
    UsersModule,
    AuthModule,
    MoviesModule,
    CommentsModule,
    MailModule,
    RedisModule,
    StreamsModule
  ]
  // providers: [StreamsService],
})

export class AppModule {}
