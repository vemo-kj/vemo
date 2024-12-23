import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Memo } from './memo.entity';
import { TimestampList } from './timestamp-list.entity';

@Entity()
export class Video {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 255 })
  thumbnail: string;

  @Column({ length: 255 })
  channel_image: string;

  @Column({ length: 30 })
  channel_name: string;

  @Column()
  runtime: Date;

  @Column({ length: 30 })
  category: string;

  @OneToMany(() => Memo, memo => memo.video)
  memos: Memo[];

  @OneToMany(() => TimestampList, timestampList => timestampList.video)
  timestampLists: TimestampList[];
} 