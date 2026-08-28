import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
    const logger = new Logger("Bootstrap");

    process.on("unhandledRejection", (reason: any) => {
        logger.error("Unhandled Promise Rejection:", reason?.stack || reason);
    });

    process.on("uncaughtException", (err: Error) => {
        logger.error("Uncaught Exception:", err.stack || err.message);
    });

    const app = await NestFactory.create(AppModule, { abortOnError: false });

    app.use(
        helmet({
            crossOriginResourcePolicy: false,
            contentSecurityPolicy: false,
        }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.use(cookieParser());
    app.enableCors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    });
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
