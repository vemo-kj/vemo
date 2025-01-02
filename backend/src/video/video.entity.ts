import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Channel } from '../channel/channel.entity';
import { Memos } from '../memos/memos.entity';
import { Playlist } from '../playlist/entities/playlist.entity';

@Entity()
export class Video {
    @PrimaryColumn({ type: 'varchar', length: 11 })
    id: string;

    @Column({ length: 100 })
    title: string;

    @Column({ length: 255 })
    thumbnails: string;

    @Column({ type: 'time' })
    duration: string;

    @Column({ length: 50 })
    category: string;

    @ManyToOne(() => Channel, channel => channel.videos)
    channel: Channel;

    @OneToMany(() => Memos, memos => memos.video)
    memos?: Memos[];

    @ManyToMany(() => Playlist, playlist => playlist.videos)
    playlists: Playlist[];
}
