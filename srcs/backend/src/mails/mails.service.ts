import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { User } from "src/users/entities/user.entity";
import type { Queue } from "bull";

@Injectable()
export class MailsService {
    constructor(@InjectQueue("mail-queue") private mailQueue: Queue) {}

    async sendVerificationEmail(user: User, token: string) {
        await this.mailQueue.add("send-verification", {
            email: user.email,
            username: user.username,
            token,
            language: user.preferredLanguage || "en"
        });
    }

    async sendResetPasswordEmail(user: User, token: string) {
        await this.mailQueue.add("reset-password", {
            email: user.email,
            username: user.username,
            token,
            language: user.preferredLanguage || "en"
        });
    }

    async sendEmailChangeVerification(user: User, token: string) {
        await this.mailQueue.add("email-change-verification", {
            email: user.email,
            username: user.username,
            token: token,
            language: user.preferredLanguage || "en"
        });
    }

    async sendPasswordChangeVerification(user: User, token: string) {
        await this.mailQueue.add("password-change-verification", {
            email: user.email,
            username: user.username,
            token: token,
            language: user.preferredLanguage || "en"
        });
    }
    async sendInviteEmail(user: User, title: string, inviteLink: string) {
        await this.mailQueue.add("send-invite", {
            email: user.email,
            username: user.username,
            title,
            inviteLink,
            language: user.preferredLanguage || "en"
        });
    }
}
