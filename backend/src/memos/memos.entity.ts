import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Captures } from '../captures/captures.entity';
import { Memo } from '../memo/memo.entity';
import { Users } from '../users/users.entity';
import { Video } from '../video/video.entity';

@Entity('memos')
export class Memos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    title: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Users, user => user.memos, { eager: true })
    user: Users;

    @ManyToOne(() => Video, video => video.memos)
    video: Video;

    @OneToMany(() => Memo, memo => memo.memos, { cascade: true })
    memo: Memo[];

    @OneToMany(() => Captures, captures => captures.memos, { cascade: true })
    captures: Captures[];
}
