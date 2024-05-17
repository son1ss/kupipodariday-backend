import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FindUsersDto } from './dto/find-users.dto';
import { Like } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findOwn(@Request() req) {
    return this.usersService.findOne({ id: req.user.userId });
  }

  @Get(':username')
  async findOneByUsername(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  remove(@Request() req) {
    return this.usersService.remove(req.user.userId);
  }

  @Post('find')
  async findMany(@Body() findUsersDto: FindUsersDto) {
    const query = findUsersDto.query.trim();
    const users = await this.usersService.findAll([
      { username: Like(`%${query}%`) },
      { email: Like(`%${query}%`) },
    ]);
    if (users.length === 0) {
      throw new NotFoundException('Users not found');
    }
    return users;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async findOwnWishes(@Request() req) {
    const user = await this.usersService.findOne({ id: req.user.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.wishes;
  }

  @Get(':username/wishes')
  async findOneByUsernameWishes(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.wishes;
  }
}
