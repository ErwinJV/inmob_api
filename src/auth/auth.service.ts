import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  login(user: User) {
    const payload = {
      id: user.id,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      roles: user.roles,
      is_active: user.is_active,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env['JWT_SECRET_KEY'],
      }),
    };
  }
}
