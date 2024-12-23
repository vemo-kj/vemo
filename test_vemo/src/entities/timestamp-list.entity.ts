import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Video } from './video.entity';
import { Timestamp } from './timestamp.entity';

@Entity()
export class TimestampList {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Video, video => video.timestampLists)
  video: Video;

  @OneToMany(() => Timestamp, timestamp => timestamp.timestampList)
  timestamps: Timestamp[];
} 