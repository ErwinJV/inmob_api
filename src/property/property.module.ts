import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { CommonModule } from 'src/common/common.module';
import { registerEnumType } from '@nestjs/graphql';
import { PropertyType } from './enums/property-type.enum';
import { PropertyStatus } from './enums/property-status.enum';
import { UsersModule } from 'src/users/users.module';
import { PropertyController } from './property.controller';
import { FilesModule } from 'src/files/files.module';
import { PropertyImage } from './entities/property-image.entity';
import { AuthModule } from 'src/auth/auth.module';

registerEnumType(PropertyType, {
  name: 'PropertyType',
  description: 'Type of property',
});

registerEnumType(PropertyStatus, {
  name: 'PropertyStatus',
  description: 'Status of property',
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    TypeOrmModule.forFeature([PropertyImage]),
    CommonModule,
    UsersModule,
    FilesModule,
    AuthModule,
  ],
  providers: [PropertyResolver, PropertyService],
  exports: [PropertyModule],
  controllers: [PropertyController],
})
export class PropertyModule {}
