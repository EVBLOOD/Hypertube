import { Injectable, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { RedisService } from "src/common/redis/redis.service";
import { MailsService } from "src/mails/mails.service";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { RegisterDto, RegisterWithOauthDto } from "./dto/register.dto";
import { verify } from "argon2";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
        private redisService: RedisService,
        private mailService: MailsService,
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.userRepo.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });
        if (exists) throw new BadRequestException("User already exists");

        const verificationToken = uuidv4();

        const user = this.userRepo.create({
            ...dto,
            emailVerificationToken: verificationToken,
        });

        await this.userRepo.save(user);

        await this.mailService.sendVerificationEmail(user, verificationToken);
        return {
            message: "Registration successful. Check your email to verify.",
        };
    }

    async registerWithOauth(dto: RegisterWithOauthDto) {
        const exists = await this.userRepo.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });
        if (exists) throw new BadRequestException("User already exists");

        const user = this.userRepo.create({
            ...dto,
            isVerified: true,
        });

        const result = await this.userRepo.save(user);

        return {
            id: result.id,
        };
    }

    async login(user: User) {
        const payload = { sub: user.id, username: user.username };

        const token = this.jwtService.sign(payload);

        await this.redisService.set(`session:${user.id}`, token, 86400);
        return { access_token: token };
    }

    async logout(user: User, token: string) {
        await this.redisService.del(`session:${user.id}`);
        return { access_token: token };
    }
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userRepo.findOne({
            where: [{ username: username }, { email: username }],
            select: [
                "email",
                "username",
                "password",
                "preferredLanguage",
                "id",
                "profilePicture",
            ],
        });
        if (user && (await verify(user?.password || "", pass))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async verifyEmail(token: string) {
        const user = await this.userRepo.findOne({
            where: { emailVerificationToken: token },
        });
        if (!user) throw new BadRequestException("Invalid or expired token");

        user.isVerified = true;
        await this.userRepo.save(user);
        return { message: "Email verified successfully" };
    }

    async verifyEmailChange(token: string, userId: string) {
        const { token: tokenSaved, email } = JSON.parse(
            (await this.redisService.get(`emailChangeToken:${userId}`)) || "",
        );
        if (!tokenSaved || tokenSaved !== token) {
            throw new BadRequestException("Invalid or expired token");
        }

        await this.redisService.del(`emailChangeToken:${userId}`);
        await this.userRepo.update(userId, { email: email });
        return { message: "Email change verified successfully" };
    }

    async passwordChange(token: string, userId: string) {
        const { token: tokenSaved, password } = JSON.parse(
            (await this.redisService.get(`passwordChange:${userId}`)) || "",
        );
        if (!tokenSaved || tokenSaved !== token) {
            throw new BadRequestException("Invalid or expired token");
        }

        await this.redisService.del(`passwordChange:${userId}`);
        const user = await this.userRepo.findOneBy({
            id: parseInt(userId) || -1,
        });
        if (!user) throw new BadRequestException("User not found");

        user.password = password;
        await this.userRepo.save(user);
        return { message: "Password changed successfully" };
    }

    async requestResetPassword(email: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new BadRequestException("User not found");

        const resetToken = uuidv4();
        await this.redisService.set(
            `passwordReset:${user.id}`,
            resetToken,
            3600,
        );

        await this.mailService.sendResetPasswordEmail(user, resetToken);
        return { message: "Password reset email sent" };
    }

    async resetPassword(token: string, newPassword: string) {
        const keys =
            await this.redisService.getKeysByPattern("passwordReset:*");
        for (const key of keys) {
            const storedToken = await this.redisService.get(key);
            if (storedToken === token) {
                const userId = key.split(":")[1];
                const user = await this.userRepo.findOneBy({
                    id: parseInt(userId) || -1,
                });
                if (!user) throw new BadRequestException("User not found");

                user.password = newPassword;
                await this.userRepo.save(user);
                await this.redisService.del(key);
                return { message: "Password changed successfully" };
            }
        }
        throw new BadRequestException("Invalid or expired token");
    }
}
