import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { TimestampList } from './timestamp-list.entity';

@Entity()
export class Timestamp {
  @PrimaryGeneratedColumn()
  timestamp_id: number;

  @Column()
  time: Date;

  @Column({ length: 100 })
  description: string;

  @ManyToOne(() => TimestampList, timestampList => timestampList.timestamps)
  timestampList: TimestampList;
} 