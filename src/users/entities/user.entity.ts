import { ObjectType, Field } from '@nestjs/graphql';
import { Property } from 'src/property/entities/property.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Field(() => Number, {
    description: `Users's date creation in epoch format (milliseconds) by Date.now(). Example: "1519211809934"`,
  })
  @Column({ type: 'numeric' })
  created_at: number;

  @Field(() => Number, {
    description: `Property's last update date in epoch format (milliseconds) by Date.now(). Example: "1519211809934"`,
  })
  @Column({ type: 'numeric' })
  updated_at: number;

  @Field(() => [Property], {
    nullable: true,
    description: `Array that contains Properties created by the user`,
  })
  @OneToMany(() => Property, (property) => property.user)
  properties?: Property[];
}
