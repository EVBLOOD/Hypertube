import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/common/redis/redis.service';
import { MailsService } from 'src/mails/mails.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private mailService: MailsService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: [{ email: dto.email }, { username: dto.username }] });
    if (exists) throw new BadRequestException('User already exists');

    const verificationToken = uuidv4();

    const user = this.userRepo.create({
      ...dto,
      emailVerificationToken: verificationToken,
    });

    await this.userRepo.save(user);

    await this.mailService.sendVerificationEmail(user, verificationToken);
    return { message: 'Registration successful. Check your email to verify.' };
  }

  async login(user: User) {
    const payload = { sub: user.id, username: user.username };

    const token = this.jwtService.sign(payload);

    await this.redisService.set(`session:${user.id}`, token, 86400);
    return { access_token: token };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({where: [{username: username}, {email: username}], select: ['email', 'username', 'password', 'preferredLanguage', 'id', 'profilePicture']})
    if (user && await verify(user?.password || '', pass)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({ where: { emailVerificationToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired token');

    user.isVerified = true;
    await this.userRepo.save(user);
    return { message: 'Email verified successfully' };
  }
}