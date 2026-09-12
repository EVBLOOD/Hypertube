import { MigrationInterface, QueryRunner } from "typeorm";

export class Leet1789214787912 implements MigrationInterface {
    name = 'Leet1789214787912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subtitle" ("id" SERIAL NOT NULL, "language" character varying NOT NULL, "filePath" character varying NOT NULL, "movieId" integer, CONSTRAINT "PK_994ad1599c74d6da447883869b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_movie_progress_likedordisliked_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TABLE "user_movie_progress" ("id" SERIAL NOT NULL, "isWishlisted" boolean NOT NULL DEFAULT false, "likedOrDisliked" "public"."user_movie_progress_likedordisliked_enum" NOT NULL DEFAULT '0', "lastMinute" double precision NOT NULL DEFAULT '0', "isWatched" boolean NOT NULL DEFAULT false, "wasWatchedLive" boolean NOT NULL DEFAULT false, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "movieId" integer, CONSTRAINT "UQ_675ea64e89b050f748acb5cde30" UNIQUE ("userId", "movieId"), CONSTRAINT "PK_41619a5b0d4a3d55dccb1f3cd77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_movie_history" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "actionDate" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "movieId" integer, CONSTRAINT "PK_8400322891af05ecdf461eafceb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movie" ("id" SERIAL NOT NULL, "imdbId" character varying NOT NULL, "title" character varying NOT NULL, "totalMinutes" double precision NOT NULL DEFAULT '0', "filePath" character varying, "lastWatchedAt" TIMESTAMP NOT NULL DEFAULT now(), "isFullyDownloaded" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_1cf786a188444119c21d86e00b5" UNIQUE ("imdbId"), CONSTRAINT "PK_cb3bb4d61cf764dc035cbedd422" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment_comment_interaction" ("id" SERIAL NOT NULL, "interaction" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "commentId" integer, CONSTRAINT "PK_c35db5fad611f094adff7859451" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "likeCount" integer NOT NULL DEFAULT '0', "dislikeCount" integer NOT NULL DEFAULT '0', "userReaction" integer NOT NULL DEFAULT '0', "userId" integer, "movieId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "profilePicture" character varying, "isVerified" boolean NOT NULL DEFAULT false, "privacy" character varying NOT NULL DEFAULT 'public', "emailVerificationToken" character varying, "passwordResetToken" character varying, "preferredLanguage" character varying NOT NULL DEFAULT 'en', "fortyTwoId" character varying, "externalStrategyId" character varying, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subtitle" ADD CONSTRAINT "FK_091630a0290ba2d115a81fe7bd7" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_movie_progress" ADD CONSTRAINT "FK_83a67555db863231049665a7649" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_movie_progress" ADD CONSTRAINT "FK_b38cdb4e776bb8224ed3293083c" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_movie_history" ADD CONSTRAINT "FK_7235d88fc69623926a1b183bde8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_movie_history" ADD CONSTRAINT "FK_26335193debd075cfb08d318396" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_comment_interaction" ADD CONSTRAINT "FK_5ba78fe1f8332e65a792cf5f022" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_comment_interaction" ADD CONSTRAINT "FK_76480460d6545c840c41298f046" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_aea4918c888422550a85e257894" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_aea4918c888422550a85e257894"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`ALTER TABLE "comment_comment_interaction" DROP CONSTRAINT "FK_76480460d6545c840c41298f046"`);
        await queryRunner.query(`ALTER TABLE "comment_comment_interaction" DROP CONSTRAINT "FK_5ba78fe1f8332e65a792cf5f022"`);
        await queryRunner.query(`ALTER TABLE "user_movie_history" DROP CONSTRAINT "FK_26335193debd075cfb08d318396"`);
        await queryRunner.query(`ALTER TABLE "user_movie_history" DROP CONSTRAINT "FK_7235d88fc69623926a1b183bde8"`);
        await queryRunner.query(`ALTER TABLE "user_movie_progress" DROP CONSTRAINT "FK_b38cdb4e776bb8224ed3293083c"`);
        await queryRunner.query(`ALTER TABLE "user_movie_progress" DROP CONSTRAINT "FK_83a67555db863231049665a7649"`);
        await queryRunner.query(`ALTER TABLE "subtitle" DROP CONSTRAINT "FK_091630a0290ba2d115a81fe7bd7"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "comment_comment_interaction"`);
        await queryRunner.query(`DROP TABLE "movie"`);
        await queryRunner.query(`DROP TABLE "user_movie_history"`);
        await queryRunner.query(`DROP TABLE "user_movie_progress"`);
        await queryRunner.query(`DROP TYPE "public"."user_movie_progress_likedordisliked_enum"`);
        await queryRunner.query(`DROP TABLE "subtitle"`);
    }

}
