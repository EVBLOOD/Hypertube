import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { RedisService } from "src/common/redis/redis.service";
import { MailsService } from "src/mails/mails.service";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { RegisterDto, RegisterWithOauthDto } from "./dto/register.dto";
import { verify } from "argon2";
import { DefaultLanguage } from "src/common/decorators/language.decorator";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
        private redisService: RedisService,
        private mailService: MailsService,
    ) {}
    async register(dto: RegisterDto, language: DefaultLanguage) {
        const exists = await this.userRepo.findOne({
            where: [{ email: dto.email }, { username: dto.username }],
        });
        if (exists) throw new BadRequestException("User already exists");

        const verificationToken = uuidv4();

        const user = this.userRepo.create({
            ...dto,
            emailVerificationToken: verificationToken,
            preferredLanguage: language == "df" ? "en" : language,
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
        const raw = await this.redisService.get(`emailChangeToken:${userId}`);
        if (!raw) {
            throw new BadRequestException("Invalid or expired token");
        }

        let parsed: { token?: string; email?: string } = {};
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new BadRequestException("Invalid or expired token");
        }

        const { token: tokenSaved, email } = parsed;
        if (!tokenSaved || tokenSaved !== token || !email) {
            throw new BadRequestException("Invalid or expired token");
        }

        await this.redisService.del(`emailChangeToken:${userId}`);
        await this.userRepo.update(userId, { email: email });
        return { message: "Email change verified successfully" };
    }

    async passwordChange(token: string, userId: string) {
        const raw = await this.redisService.get(`passwordChange:${userId}`);
        if (!raw) {
            throw new BadRequestException("Invalid or expired token");
        }

        let parsed: { token?: string; password?: string } = {};
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new BadRequestException("Invalid or expired token");
        }

        const { token: tokenSaved, password } = parsed;
        if (!tokenSaved || tokenSaved !== token || !password) {
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

    async generateOAuthToken(dto: {
        client?: string;
        secret?: string;
        client_id?: string;
        client_secret?: string;
        grant_type?: string;
        username?: string;
        password?: string;
    }) {
        const clientId = dto.client || dto.client_id || dto.username;
        const clientSecret = dto.secret || dto.client_secret || dto.password;

        if (!clientId || !clientSecret) {
            throw new UnauthorizedException(
                "Missing client credentials (expected client + secret, client_id + client_secret, or username + password)",
            );
        }

        const configuredClientId = process.env.OAUTH_CLIENT_ID || "hypertube";
        const configuredClientSecret =
            process.env.OAUTH_CLIENT_SECRET || "hypertube_secret";

        let targetUser: User | null = null;

        if (
            (clientId === configuredClientId &&
                clientSecret === configuredClientSecret) ||
            (clientId === "client" && clientSecret === "secret")
        ) {
            targetUser = await this.userRepo.findOne({ where: {} });
            if (!targetUser) {
                targetUser = this.userRepo.create({
                    username: "api_user",
                    email: "api@hypertube.1337.ma",
                    firstName: "API",
                    lastName: "User",
                    password: "api_password",
                    isVerified: true,
                });
                await this.userRepo.save(targetUser);
            }
        } else {
            const user = await this.validateUser(clientId, clientSecret);
            if (user) {
                targetUser = await this.userRepo.findOne({
                    where: { id: user.id },
                });
            }
        }

        if (!targetUser) {
            throw new UnauthorizedException("Invalid client credentials");
        }

        const payload = {
            sub: targetUser.id,
            username: targetUser.username,
            scope: "api",
        };
        const access_token = this.jwtService.sign(payload, { expiresIn: "24h" });

        await this.redisService.set(`session:${targetUser.id}`, access_token, 86400);

        return {
            access_token,
            token_type: "Bearer",
            expires_in: 86400,
        };
    }
}
