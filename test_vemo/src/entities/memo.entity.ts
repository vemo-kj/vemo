import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity()
export class Memo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ length: 100 })
  description: string;

  @Column({ length: 20 })
  author: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.memos)
  user: User;

  @ManyToOne(() => Video, video => video.memos)
  video: Video;
} 