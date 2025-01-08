import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity('captures')
export class Captures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('time')
    timestamp: string;

    @Column({ length: 255 })
    image: string;

    @ManyToOne(() => Memos, memos => memos.memo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
