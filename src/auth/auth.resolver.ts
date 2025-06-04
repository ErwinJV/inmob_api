import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';

import { Auth } from './decorators/auth.decorator';
import { AuthInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth.response';
import { AuthService } from './auth.service';
import { AuthVerificationResponse } from './dto/auth-verification.response';
import { CommonService } from 'src/common/common.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
  ) {}

  @Mutation(() => AuthResponse)
  async login(@Args('authInput') authInput: AuthInput) {
    try {
      const user = await this.authService.validateUser(
        authInput.email,
        authInput.password,
      );

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      return this.authService.login(user);
    } catch (error) {
      console.log(error);
      return this.commonService.handleExceptions(error);
    }
  }

  @Query(() => AuthVerificationResponse)
  @Auth()
  verifyAuthToken(): AuthVerificationResponse {
    return { verification: true };
  }
}
