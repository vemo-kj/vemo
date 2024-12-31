import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';
import { Playlist } from '../playlist/playlist.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 30 })
    name: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 60 })
    password: string;

    @Column({ type: 'date' })
    birth: Date;

    @Column({ type: 'enum', enum: ['Male', 'Female', 'Other'] })
    gender: string;

    @Column({ length: 30 })
    nickname: string;

    @Column({ length: 255, nullable: true })
    profileImage: string;

    @Column({ length: 255, nullable: true })
    introduction: string;

    @OneToMany(() => Memos, memos => memos.user)
    memos: Memos[];

    @OneToMany(() => Playlist, playlist => playlist.user)
    playlists: Playlist[];
}
