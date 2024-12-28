import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Video } from '../video/video.entity';

@Entity()
export class Channel {
    @PrimaryGeneratedColumn('uuid')
    channelId: string;

    @Column({ length: 255 })
    channelThumbnail: string;

    @Column({ length: 100 })
    channelTitle: string;

    @OneToMany(() => Video, video => video.channel)
    videos: Video[];
}
