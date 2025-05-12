import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';

@Entity()
@ObjectType()
export class Property {
  @Field(() => String, {
    description: `Property's id (uuid). Example: "f7d27564-939c-42f2-90f8-ee8eece4bc8c"`,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, {
    description: `Property's title, Example: "Apartamento en Buena Vista"`,
  })
  @Column({ type: 'varchar', length: 25, unique: true })
  title: string;

  @Field(() => String, {
    description: `Property's slug, generate based of the title property. Example: "Apartamento-en-Buena-Vista"`,
  })
  @Column({ type: 'varchar', length: 25, unique: true })
  slug: string;

  @Field(() => PropertyStatus, {
    description: `Property's status. Example: "SALE"`,
  })
  @Column({ type: 'enum', enum: PropertyStatus })
  status: PropertyStatus;

  @Field(() => PropertyType, {
    description: `Property's type. Example: "HOUSE"`,
  })
  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Field(() => String, {
    description: `Property's description. Example: "Apartamento amplio, con 4 habitaciones, comedor, dos banos y una sala, etc." `,
  })
  @Column({ type: 'varchar', length: 125 })
  description: string;

  @Field(() => String, {
    description: `Property's user id creator. Example: "1b8800a2-2385-403a-893b-3eba76ba4608" `,
  })
  @Column()
  userId: string;

  @Field(() => String, {
    description: `Property's place. Example: "Av. Bella Vista Maracaibo, Zulia'`,
  })
  @Column({ type: 'varchar', length: 90 })
  place: string;

  @Field(() => Float, {
    description: `Property's latitude (Google Maps). Example: "41.40338"`,
  })
  @Column({ type: 'float', nullable: true })
  lat?: number;

  @Field(() => Float, {
    description: `Property's longitude (Google Maps). Example: "2.17403"`,
  })
  @Column({ type: 'float', nullable: true })
  long?: number;

  @Field(() => Int, { description: `Property's total bathrooms. Example: "2"` })
  @Column({ type: 'smallint', nullable: true })
  num_bathrooms?: number;

  @Field(() => Int, { description: `Property's total bedrooms. Example: "4"` })
  @Column({ type: 'smallint', nullable: true })
  num_bedrooms?: number;

  @Field(() => Int, { description: `Property's total pools. Example: "1"` })
  @Column({ type: 'smallint', nullable: true })
  num_pools?: number;

  @Field(() => Int, {
    description: `Property's total parkings lot. Example: "2"`,
  })
  @Column({ type: 'smallint', nullable: true })
  num_parking_lot?: number;

  @Field(() => Number, {
    description: `Property's date creation in epoch format (milliseconds) by Date.now(). Example: "1519211809934"`,
  })
  @Column({ type: 'numeric' })
  created_at: number;

  @Field(() => Number, {
    description: `Property's last update date in epoch format (milliseconds) by Date.now() method. Example: "1519211809934"`,
  })
  @Column({ type: 'numeric' })
  updated_at: number;

  @Field(() => User, {
    description: `Property's user creator`,
  })
  @ManyToOne(() => User, (user) => user.properties)
  user: User;
}
