import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from './property.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class PropertyVirtualTour {
  @Field(() => ID, { description: '' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Property)
  @ManyToOne(() => Property, (property) => property.virtualTour, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  property: Property;

  @Field(() => String)
  @Column('varchar', { unique: true })
  url: string;
}
