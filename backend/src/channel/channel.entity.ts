import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Video } from '../video/video.entity';

@Entity('channel')
export class Channel {
    @PrimaryColumn({ type: 'varchar', length: 24 })
    id: string;

    @Column({ length: 255 })
    thumbnails: string;

    @Column({ length: 100 })
    title: string;

    @OneToMany(() => Video, video => video.channel, { cascade: true })
    videos?: Video[];
}
