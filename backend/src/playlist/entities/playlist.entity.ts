import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../users/users.entity';
import { Video } from '../../video/video.entity';

@Entity('playlist')
export class Playlist {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @ManyToOne(() => Users, user => user.playlists, { onDelete: 'CASCADE' })
    user: Users;

    @ManyToMany(() => Video, video => video.playlists, { cascade: true })
    @JoinTable({
        name: 'playlist_video',
        joinColumn: { name: 'playlistId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'videoId', referencedColumnName: 'id' },
    })
    videos: Video[];
}
