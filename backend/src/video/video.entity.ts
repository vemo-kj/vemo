import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';
import { PlaylistVideo } from '../playlist/playlist_video.entity';

@Entity()
export class Video {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    title: string;

    @Column({ length: 255 })
    thumbnail: string;

    @Column({ length: 255 })
    channel_image: string;

    @Column({ length: 100 })
    channel_name: string;

    @Column({ type: 'time' })
    runtime: string;

    @Column({ length: 50 })
    category: string;

    @OneToMany(() => Memos, memos => memos.video)
    memos: Memos[];

    @OneToMany(() => PlaylistVideo, playlistVideo => playlistVideo.video)
    playlistVideos: PlaylistVideo[];
}
