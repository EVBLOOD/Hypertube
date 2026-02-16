import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  BeforeInsert, 
  BeforeUpdate,
  OneToMany 
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as argon2 from 'argon2';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @Column({ select: false })
  password?: string;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: false })
  isOAuthUser: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$argon2')) {
      this.password = await argon2.hash(this.password);
    }
  }
}