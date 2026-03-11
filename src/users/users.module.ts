import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { registerEnumType } from '@nestjs/graphql';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';
import { UsersController } from './users.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersResolver } from './users.resolver';
import { PropertyModule } from 'src/property/property.module';

registerEnumType(ValidRoles, {
  name: 'ValidRoles',
  description: 'Valid roles for users auth',
});

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CommonModule,
    forwardRef(() => PropertyModule),
    CloudinaryModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
