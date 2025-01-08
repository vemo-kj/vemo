import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity('memo')
export class Memo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('time')
    timestamp: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @ManyToOne(() => Memos, memos => memos.memo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
