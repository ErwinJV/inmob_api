import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  table: string;

  @Column('uuid')
  rowID: string;

  @Column('varchar')
  url: string;
}
