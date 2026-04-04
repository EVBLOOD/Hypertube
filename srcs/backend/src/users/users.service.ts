import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findById(id: number, requestorId: number): Promise<User> {
    const query = this.userRepo.createQueryBuilder('user')
      .where('user.id = :id', { id });

    // Privacy Rule: Only the owner sees their own email
    if (id === requestorId) {
      query.addSelect('user.email');
    }

    const user = await query.getOne();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    // Return all users for the "search" feature (excluding emails)
    return this.userRepo.find();
  }
}