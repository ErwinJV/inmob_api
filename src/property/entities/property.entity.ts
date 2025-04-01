import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

@Entity()
@ObjectType()
export class Property {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 25, unique: true })
  title: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 25, unique: true })
  slug: string;

  @Field(() => PropertyStatus)
  @Column({ type: 'enum', enum: PropertyStatus })
  status: PropertyStatus;

  @Field(() => PropertyType)
  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Field(() => String)
  @Column({ type: 'varchar', length: 125 })
  description: string;

  @Field(() => String)
  @Column()
  userId: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 90 })
  place: string;

  @Field(() => Float)
  @Column({ type: 'float', nullable: true })
  lat?: number;

  @Field(() => Float)
  @Column({ type: 'float', nullable: true })
  long?: number;

  @Field(() => Int)
  @Column({ type: 'smallint', nullable: true })
  num_bathrooms?: number;

  @Field(() => Int)
  @Column({ type: 'smallint', nullable: true })
  num_bedrooms?: number;

  @Field(() => Int)
  @Column({ type: 'smallint', nullable: true })
  num_pools?: number;

  @Field(() => Int)
  @Column({ type: 'smallint', nullable: true })
  num_parking_lot?: number;

  @Field(() => Number)
  @Column({ type: 'numeric' })
  created_at: number;

  @Field(() => Number)
  @Column({ type: 'numeric' })
  updated_at: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.properties)
  user: User;
}
