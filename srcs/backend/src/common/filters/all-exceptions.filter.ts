import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        if (host.getType() !== "http") {
            this.logger.error("Non-HTTP Exception caught:", exception instanceof Error ? exception.stack : exception);
            return;
        }

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (!response || typeof response.status !== "function") {
            return;
        }

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = "Internal server error";
        let error = "Internal Server Error";

        const reqMethod = request?.method || "UNKNOWN";
        const reqUrl = request?.url || "UNKNOWN";

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === "string") {
                message = res;
                error = exception.name.replace(/Exception$/, "");
            } else if (typeof res === "object" && res !== null) {
                const resObj = res as Record<string, any>;
                message = resObj.message || exception.message;
                error = resObj.error || exception.name.replace(/Exception$/, "");
            }
        } else if (exception instanceof Error) {
            this.logger.error(
                `Unhandled Exception on ${reqMethod} ${reqUrl}: ${exception.message}`,
                exception.stack,
            );

            message =
                process.env.NODE_ENV === "production"
                    ? "An unexpected internal server error occurred"
                    : exception.message;
            error = "Internal Server Error";
        } else {
            this.logger.error(
                `Unknown error thrown on ${reqMethod} ${reqUrl}`,
                exception,
            );
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: reqUrl,
            method: reqMethod,
            error,
            message,
        };

        if (response.headersSent) {
            return;
        }

        response.status(status).json(errorResponse);
    }
}
