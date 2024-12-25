import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Playlist } from './playlist.entity';
import { Video } from '../video/video.entity';

@Entity()
export class PlaylistVideo {
    @PrimaryColumn()
    playlist_id: number;

    @PrimaryColumn()
    video_id: string;

    @ManyToOne(() => Playlist, playlist => playlist.playlistVideos)
    playlist: Playlist;

    @ManyToOne(() => Video, video => video.playlistVideos)
    video: Video;
}
