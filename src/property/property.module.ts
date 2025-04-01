import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyResolver } from './property.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { CommonModule } from 'src/common/common.module';
import { registerEnumType } from '@nestjs/graphql';
import { PropertyType } from './enums/property-type.enum';
import { PropertyStatus } from './enums/property-status.enum';

registerEnumType(PropertyType, {
  name: 'PropertyType',
  description: 'Type of property',
});

registerEnumType(PropertyStatus, {
  name: 'PropertyStatus',
  description: 'Status of property',
});

@Module({
  imports: [TypeOrmModule.forFeature([Property]), CommonModule],
  providers: [PropertyResolver, PropertyService],
  exports: [PropertyModule],
})
export class PropertyModule {}
