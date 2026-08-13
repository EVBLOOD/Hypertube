import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { BullModule } from "@nestjs/bull";
import { MailProcessor } from "./mails.processor";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { MailsService } from "./mails.service";

@Module({
    imports: [
        BullModule.registerQueue({
            name: "mail-queue",
        }),
        MailerModule.forRoot({
            transport: {
                host: process.env.MAIL_SERVER,
                port: Number(process.env.MAIL_PORT),
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                },
            },
            defaults: {
                from: '"Hypertube Team" <noreply@hypertube.com>',
            },
            template: {
                dir: join(__dirname, "templates"),
                adapter: new HandlebarsAdapter(),
                options: { strict: true },
            },
        }),
    ],
    providers: [MailsService, MailProcessor],
    exports: [MailsService],
})
export class MailModule {}
