import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcryptjs';
import { CommonService } from 'src/common/common.service';
import { PaginationDto } from 'src/common/dtos/paginator.dto';
import { UsersDataResponse } from './types/UsersDataResponse.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const date = Date.now();
    if (
      !createUserInput.name ||
      !createUserInput.last_name ||
      !createUserInput.email ||
      !createUserInput.password
    ) {
      throw new BadRequestException(
        `Some of the not-null values (name,last_name,email,password) of createUserInput is undefined`,
      );
    }
    try {
      const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
      const user = this.userRepository.create({
        ...createUserInput,
        password: hashedPassword,
        created_at: date,
        updated_at: date,
      });

      const newUser = await this.userRepository.save(user);

      return {
        name: newUser.name,
        last_name: newUser.last_name,
        email: newUser.email,
        id: newUser.id,
        is_active: newUser.is_active,
        roles: newUser.roles,
      };
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: {
          email: true,
          id: true,
          is_active: true,
          last_name: true,
          name: true,
          roles: true,
          profile_picture_url: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with id: ${id} not found`);
      }

      return user;
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<UsersDataResponse | undefined> {
    const { limit = 0, offset = 0, order = 'DESC' } = paginationDto;

    try {
      const total = await this.userRepository.count();
      const users = await this.userRepository.find({
        order: { id: { direction: order } },
        take: limit,
        skip: offset,
      });

      if (!users || !users.length) {
        throw new NotFoundException('Users table are empty');
      }

      return {
        total,
        users,
      };
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    try {
      await this.findOne(id);
      if (updateUserInput.password && updateUserInput.password !== '') {
        updateUserInput.password = await bcrypt.hash(
          updateUserInput.password,
          10,
        );

        return await this.userRepository.update(id, {
          ...updateUserInput,
          updated_at: Date.now(),
        });
      } else {
        return await this.userRepository.update(id, {
          email: updateUserInput.email,
          name: updateUserInput.name,
          last_name: updateUserInput.last_name,
          roles: updateUserInput.roles,
          updated_at: Date.now(),
        });
      }
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);
      if (!user) {
        throw new NotFoundException(`User with ${id} not found`);
      }
      return await this.userRepository.remove(user);
    } catch (error) {
      this.commonService.handleExceptions(error);
    }
  }
}
