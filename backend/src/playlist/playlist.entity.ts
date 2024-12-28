import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { PlaylistVideo } from './playlist_video.entity';

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    playlistId: number;

    @Column({ length: 50 })
    name: string;

    @ManyToOne(() => User, user => user.playlists)
    user: User;

    @OneToMany(() => PlaylistVideo, playlistVideo => playlistVideo.playlist)
    playlistVideos: PlaylistVideo[];
}
