import { ObjectType, Field } from '@nestjs/graphql';
import { Property } from '../../property/entities/property.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GraphQLDateTime } from 'graphql-scalars';

@Entity()
@ObjectType()
export class User {
  @Field(() => String, {
    description: `User's id (uuid), Example: "c2793525-56c5-4fce-8240-f2d32d9fc695"`,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { description: `User's name: Example: "John"` })
  @Column({ type: 'varchar', length: 25 })
  name: string;

  @Field(() => String, { description: `User's last name: Example: "Walker"` })
  @Column({ type: 'varchar', length: 25 })
  last_name: string;

  @Field(() => String, {
    description: `User's email, must be unique. Example: "example@email.com"`,
  })
  @Column({ type: 'varchar', length: 25 })
  email: string;

  @Field(() => String, { description: `User's password. Must be encrypted` })
  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Field(() => Boolean, {
    description: `Boolean data that shows whether the user is active or has been suspended."`,
  })
  @Column({ type: 'bool', default: true })
  is_active: boolean;

  @Field(() => [String], {
    description: `Contains the user roles: Array  Example: ['USER', 'ADMIN']`,
  })
  @Column({ type: 'varchar', array: true, default: ['USER'] })
  roles: string[];

  @Field(() => String, {
    description: `User's profile picture URL. Example: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"`,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  profile_picture_url?: string;

  @Field(() => GraphQLDateTime, {
    description: `Users's date creation in ISO format. Example: "2023-01-01T00:00:00.000Z"`,
  })
  @CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Field(() => GraphQLDateTime, {
    description: `User's last update date in ISO format. Example: "2023-01-01T00:00:00.000Z"`,
  })
  @UpdateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Field(() => [Property], {
    nullable: true,
    description: `Array that contains Properties created by the user`,
  })
  @OneToMany(() => Property, (property) => property.user)
  properties?: Property[];
}
