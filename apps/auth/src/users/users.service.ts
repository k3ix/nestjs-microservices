import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { FilterQuery } from 'mongoose';
import { UserDocument } from '@app/common';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(data: CreateUserDto) {
    await this.validateCreateUserDto(data);
    return this.usersRepository.create({
      ...data,
      password: await bcrypt.hash(data.password, 10),
    });
  }

  private async validateCreateUserDto(data: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: data.email });
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists');
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async getUser(query: FilterQuery<UserDocument>) {
    return this.usersRepository.findOne(query);
  }
}
