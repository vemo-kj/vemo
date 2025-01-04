import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Video } from '../video/video.entity';
import { Memo } from '../memo/memo.entity';
import { Users } from '../users/users.entity';
import { Captures } from '../captures/captures.entity';

@Entity()
export class Memos {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    title: string;

    //TODO: 제거 필요
    @Column({ length: 255 })
    description: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'datetime', nullable: true })
    updatedAt: Date;

    @ManyToOne(() => Users, user => user.memos, { eager: true })
    user: Users;

    @ManyToOne(() => Video, video => video.memos)
    video: Video;

    @OneToMany(() => Memo, memo => memo.memos, { cascade: true })
    memo: Memo[];

    @OneToMany(() => Captures, capture => capture.memos, { cascade: true })
    capture: Captures[];
}
