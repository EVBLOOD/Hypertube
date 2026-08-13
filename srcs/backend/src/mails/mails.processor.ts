import { Process, Processor } from "@nestjs/bull";
import type { Job } from "bull";
import { MailerService } from "@nestjs-modules/mailer";
import { Logger } from "@nestjs/common";

@Processor("mail-queue")
export class MailProcessor {
    private readonly logger = new Logger(MailProcessor.name);

    constructor(private readonly mailerService: MailerService) {}

    @Process("send-verification")
    async handleVerificationEmail(job: Job) {
        this.logger.debug(`Sending verification email to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: "🎬 Action! Verify your Hypertube account",
                template: "./verification",
                context: {
                    name: job.data.username,
                    url: `${process.env.FRONTEND_URL}/verify?token=${job.data.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }

    @Process("reset-password")
    async handleResetPassword(job: Job) {
        this.logger.log(`Sending verification email to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: "🎬 Action! Verify your Hypertube account",
                template: "./verification",
                context: {
                    name: job.data.username,
                    url: `${process.env.FRONTEND_URL}/verify?token=${job.data.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }
}
