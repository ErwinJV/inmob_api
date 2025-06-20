import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Property } from './property.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class PropertyImage {
  @Field(() => ID, { description: '' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Property)
  @ManyToOne(() => Property, (property) => property.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  property: Property;

  @Field(() => String)
  @Column('varchar')
  url: string;
}
