import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { registerEnumType } from '@nestjs/graphql';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description: 'Valid roles for users auth',
});

@Module({
  imports: [TypeOrmModule.forFeature([User]), CommonModule],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
