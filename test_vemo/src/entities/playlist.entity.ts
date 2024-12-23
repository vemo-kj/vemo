import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Video } from './video.entity';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  playlist_id: number;

  @Column({ length: 30 })
  name: string;

  @ManyToOne(() => User, user => user.playlists)
  user: User;

  @ManyToMany(() => Video)
  @JoinTable({
    name: 'playlist_video',
    joinColumn: { name: 'playlist_id', referencedColumnName: 'playlist_id' },
    inverseJoinColumn: { name: 'video_id', referencedColumnName: 'id' }
  })
  videos: Video[];
} 