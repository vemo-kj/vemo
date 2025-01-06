import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity()
export class Captures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'time' })
    timestamp: string;

    @Column({ type: 'longtext' })
    image: string;

    @ManyToOne(() => Memos, memos => memos.capture)
    memos: Memos;
}
