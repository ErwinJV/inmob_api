import { ObjectType, Field } from '@nestjs/graphql';
import { Property } from 'src/property/entities/property.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @Field(() => String)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 25 })
  name: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 25 })
  last_name: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 25 })
  email: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Field(() => Boolean)
  @Column({ type: 'bool', default: true })
  is_active: boolean;

  @Field(() => [String])
  @Column({ type: 'varchar', array: true, default: ['USER'] })
  roles: string[];

  @Field(() => Number)
  @Column({ type: 'numeric' })
  created_at: number;

  @Field(() => Number)
  @Column({ type: 'numeric' })
  updated_at: number;

  @Field(() => [Property], { nullable: true })
  @OneToMany(() => Property, (property) => property.user)
  properties?: Property[];
}
