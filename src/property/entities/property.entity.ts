import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyType } from '../enums/property-type.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyImage } from './property-image.entity';
import { PropertyVideo } from './property-video.entity';
import { PropertyImage360 } from './property-image-360';
import { PropertyVirtualTour } from './property-virtual-tour';

@Entity()
@ObjectType()
export class Property {
  @Field(() => ID, {
    description: `Property's id (uuid). Example: "f7d27564-939c-42f2-90f8-ee8eece4bc8c"`,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, {
    description: `Property's title. Max character length: 25, Example: "Apartamento en Buena Vista. "`,
  })
  @Column({ type: 'varchar', length: 125, unique: true })
  title: string;

  @Field(() => String, {
    description: `Property's slug, generate based of the title property. Max character length: 25, Example: "Apartamento-en-Buena-Vista"`,
  })
  @Column({ type: 'varchar', length: 125, unique: true })
  slug: string;

  @Field(() => Int, {
    description: 'Area in square meters of the property',
  })
  @Column({ type: 'int' })
  area: number;

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
    description: `Property's description. Max character length: 125, Example: "Apartamento amplio, con 4 habitaciones, comedor, dos banos y una sala, etc." `,
  })
  @Column({ type: 'varchar', length: 1200 })
  description: string;

  @Field(() => Float, {
    description: `Property's price. Example: "125000.00"`,
  })
  @Column({ type: 'float' })
  price: number;

  @Field(() => String, {
    description: `Property's user id creator. Example: "1b8800a2-2385-403a-893b-3eba76ba4608" `,
  })
  @Column()
  userId: string;

  @Field(() => String, {
    description: `Property's place. Example: "Av. Bella Vista Maracaibo, Zulia'`,
  })
  @Column({ type: 'varchar', length: 125 })
  place: string;

  @Field(() => Float, {
    description: `Property's latitude (Google Maps). Example: "41.40338"`,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  lat?: number;

  @Field(() => Float, {
    description: `Property's longitude (Google Maps). Example: "2.17403"`,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  long?: number;

  @Field(() => Int, {
    description: `Property's total bathrooms. Example: "2"`,
    nullable: true,
  })
  @Column({ type: 'smallint', nullable: true })
  num_bathrooms?: number;

  @Field(() => Int, {
    description: `Property's total bedrooms. Example: "4"`,
    nullable: true,
  })
  @Column({ type: 'smallint', nullable: true })
  num_bedrooms?: number;

  @Field(() => Int, {
    description: `Property's total pools. Example: "1"`,
    nullable: true,
  })
  @Column({ type: 'smallint', nullable: true })
  num_pools?: number;

  @Field(() => Int, {
    description: `Property's total parkings lot. Example: "2"`,
    nullable: true,
  })
  @Column({ type: 'smallint', nullable: true })
  num_parking_lot?: number;

  @Field(() => Number, {
    description: `Property's date creation in epoch format (milliseconds) by Date.now(). Example: "1519211809934"`,
    nullable: true,
  })
  @Column({ type: 'numeric' })
  created_at: number;

  @Field(() => Number, {
    description: `Property's last update date in epoch format (milliseconds) by Date.now() method. Example: "1519211809934"`,
    nullable: true,
  })
  @Column({ type: 'numeric' })
  updated_at: number;

  @Field(() => User, {
    description: `Property's user creator`,
  })
  @ManyToOne(() => User, (user) => user.properties)
  user: User;

  @Field(() => [PropertyImage], { nullable: true })
  @OneToMany(() => PropertyImage, (propertyImage) => propertyImage.property, {
    cascade: true,
    eager: true,
  })
  images?: PropertyImage[];

  @Field(() => [PropertyImage360], { nullable: true })
  @OneToMany(
    () => PropertyImage360,
    (propertyImage360) => propertyImage360.property,
    {
      cascade: true,
      eager: true,
    },
  )
  images360?: PropertyImage360[];

  @Field(() => [PropertyVideo], { nullable: true })
  @OneToMany(() => PropertyVideo, (propertyVideo) => propertyVideo.property, {
    cascade: true,
    eager: true,
  })
  videos?: PropertyVideo[];

  @Field(() => [PropertyVirtualTour], { nullable: true })
  @OneToMany(
    () => PropertyVirtualTour,
    (propertyVirtualTour) => propertyVirtualTour.property,
    {
      cascade: true,
      eager: true,
    },
  )
  virtualTour?: PropertyVirtualTour[];

  @Field(() => String, {
    description: `Property's main picture URL. Example: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg". This value is optional`,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 300, nullable: true })
  main_picture_url?: string;
}
