import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/users.entity';
import { Video } from '../../video/video.entity';

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => User, user => user.playlists, { onDelete: 'CASCADE' })
    user: User;

    @ManyToMany(() => Video, video => video.playlists)
    @JoinTable({
        name: 'playlist_video',
        joinColumn: { name: 'playlistId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'videoId', referencedColumnName: 'id' },
    })
    videos: Video[];
}
