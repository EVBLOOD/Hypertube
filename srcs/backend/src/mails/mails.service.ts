import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { User } from 'src/users/entities/user.entity';
import type { Queue } from 'bull';

@Injectable()
export class MailsService {
  constructor(@InjectQueue('mail-queue') private mailQueue: Queue) {}

  async sendVerificationEmail(user: User, token: string) {
    await this.mailQueue.add('send-verification', {
      email: user.email,
      username: user.username,
      token,
    });
  }

  async sendResetPasswordEmail(user: User, token: string) {
    await this.mailQueue.add('reset-password', {
      email: user.email,
      username: user.username,
      token,
    });
  }
}