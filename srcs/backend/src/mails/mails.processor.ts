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
                    url: `${process.env.PUBLIC_API_URL}/auth/verify/${job.data.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }

    @Process("reset-password")
    async handleResetPassword(job: Job) {
        this.logger.log(`Sending reset password email to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: "🎬 Action! Reset your Hypertube password",
                template: "./reset-password",
                context: {
                    name: job.data.username,
                    url: `${process.env.FRONTEND_URL}/reset-password?token=${job.data.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }

    @Process("email-change-verification")
    async handleEmailChangeVerification(job: Job) {
        this.logger.log(
            `Sending email change verification to ${job.data.email}...`,
        );
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: "🎬 Action! Verify your new email for Hypertube",
                template: "./email-change-verification",
                context: {
                    name: job.data.username,
                    url: `${process.env.PUBLIC_API_URL}/auth/verify-email-change/${job.data.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }

    @Process("password-change-verification")
    async handlePasswordChangeVerification(job: Job) {
        this.logger.log(
            `Sending password change verification to ${job.data.email}...`,
        );
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: "🎬 Action! Verify your new password for Hypertube",
                template: "./password-change-verification",
                context: {
                    name: job.data.username,
                    url: `${process.env.PUBLIC_API_URL}/auth/change-password/${job.data.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }
    @Process("send-invite")
    async handleSendInvite(job: Job) {
        this.logger.log(`Sending movie invite email to ${job.data.email}...`);
        try {
            await this.mailerService.sendMail({
                to: job.data.email,
                subject: `🎬 Action! ${job.data.username} invited you to watch a movie on Hypertube`,
                template: "./invite",
                context: {
                    name: job.data.username,
                    title: job.data.title,
                    url: job.data.inviteLink,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email: ${error.message}`);
        }
    }
}
