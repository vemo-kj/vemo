import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Memo } from './memo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column()
  birth: Date;

  @Column({ length: 10 })
  gender: string;

  @Column({ length: 30 })
  nickname: string;

  @Column({ length: 255, nullable: true })
  profile_image: string;

  @Column({ length: 100, nullable: true })
  introduction: string;

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Playlist[];

  @OneToMany(() => Memo, memo => memo.user)
  memos: Memo[];
} 