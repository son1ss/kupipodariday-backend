import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(query?: any): Promise<User[]> {
    return await this.usersRepository.find({ where: query });
  }

  async findOne(query: any): Promise<User> {
    return await this.usersRepository.findOne({
      where: query,
      relations: ['wishes'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password)
      await this.usersRepository.update(id, {
        ...updateUserDto,
        password: await bcrypt.hash(updateUserDto.password, 10),
      });
    return await this.usersRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    await this.usersRepository.delete(id);
    return user;
  }
}
