import { Process, Processor } from "@nestjs/bull";
import type { Job } from "bull";
import { MailerService } from "@nestjs-modules/mailer";
import { Logger } from "@nestjs/common";

@Processor("mail-queue")
export class MailProcessor {
    private readonly logger = new Logger(MailProcessor.name);

    constructor(private readonly mailerService: MailerService) {}

    private getSafeLanguage(lang?: string): "en" | "fr" | "ar" {
        return lang === "fr" || lang === "ar" ? lang : "en";
    }

    @Process("send-verification")
    async handleVerificationEmail(job: Job) {
        const lang = this.getSafeLanguage(job.data?.language);
        const mapSubject = {
            "en": "🎬 Action! Verify your Hypertube account",
            "fr": "🎬 Action! Vérifiez votre compte pour Hypertube",
            "ar": "🎬 إجراء! تحقق من حسابك لـ Hypertube",
        };
        try {
            await this.mailerService.sendMail({
                to: job.data?.email,
                subject: mapSubject[lang],
                template: `./${lang}/verification`,
                context: {
                    name: job.data?.username,
                    url: `${process.env.PUBLIC_API_URL}/auth/verify/${job.data?.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send verification email: ${error?.message || error}`);
        }
    }

    @Process("reset-password")
    async handleResetPassword(job: Job) {
        const lang = this.getSafeLanguage(job.data?.language);
        const mapSubject = {
            "en": "🎬 Action! Reset your Hypertube password",
            "fr": "🎬 Action! Réinitialisez votre mot de passe pour Hypertube",
            "ar": "🎬 إجراء! إعادة تعيين كلمة المرور الخاصة بك لـ Hypertube",
        };
        try {
            await this.mailerService.sendMail({
                to: job.data?.email,
                subject: mapSubject[lang],
                template: `./${lang}/reset-password`,
                context: {
                    name: job.data?.username,
                    url: `${process.env.FRONTEND_URL}/reset-password?token=${job.data?.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send reset password email: ${error?.message || error}`);
        }
    }

    @Process("email-change-verification")
    async handleEmailChangeVerification(job: Job) {
        const lang = this.getSafeLanguage(job.data?.language);
        const mapSubject = {
            "en": "🎬 Action! Verify your new email for Hypertube",
            "fr": "🎬 Action! Vérifiez votre nouvel e-mail pour Hypertube",
            "ar": "🎬 إجراء! تحقق من بريدك الإلكتروني الجديد لـ Hypertube",
        };
        try {
            await this.mailerService.sendMail({
                to: job.data?.email,
                subject: mapSubject[lang],
                template: `./${lang}/email-change-verification`,
                context: {
                    name: job.data?.username,
                    url: `${process.env.PUBLIC_API_URL}/auth/verify-email-change/${job.data?.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send email change verification: ${error?.message || error}`);
        }
    }

    @Process("password-change-verification")
    async handlePasswordChangeVerification(job: Job) {
        const lang = this.getSafeLanguage(job.data?.language);
        const mapSubject = {
            "en": "🎬 action! Verify your new password for Hypertube",
            "fr": "🎬 action! Vérifiez votre nouveau mot de passe pour Hypertube",
            "ar": "🎬 إجراء! تحقق من كلمة المرور الجديدة لـ Hypertube",
        };
        try {
            await this.mailerService.sendMail({
                to: job.data?.email,
                subject: mapSubject[lang],
                template: `./${lang}/password-change-verification`,
                context: {
                    name: job.data?.username,
                    url: `${process.env.PUBLIC_API_URL}/auth/change-password/${job.data?.token}`,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send password change verification: ${error?.message || error}`);
        }
    }
    @Process("send-invite")
    async handleSendInvite(job: Job) {
        const lang = this.getSafeLanguage(job.data?.language);
        const username = job.data?.username || "A user";
        const mapSubject = {
            "en": `🎬 Action! ${username} invited you to watch a movie on Hypertube`,
            "fr": `🎬 Action! ${username} vous a invité à regarder un film sur Hypertube`,
            "ar": `🎬 إجراء! ${username} دعاك لمشاهدة فيلم على Hypertube`,
        };
        try {
            await this.mailerService.sendMail({
                to: job.data?.email,
                subject: mapSubject[lang],
                template: `./${lang}/invite`,
                context: {
                    name: username,
                    title: job.data?.title,
                    url: job.data?.inviteLink,
                },
            });
        } catch (error: any) {
            this.logger.error(`Failed to send invite email: ${error?.message || error}`);
        }
    }
}
