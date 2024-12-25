import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity()
export class Memo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'time' })
    timestamp: string;

    @Column({ length: 255 })
    description: string;

    @ManyToOne(() => Memos, memos => memos.memo)
    memos: Memos;
}
