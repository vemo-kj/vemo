import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity('Memo')
export class Memo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('time')
    timestamp: Date;

    @Column({ length: 1000, nullable: true })
    description: string;

    @ManyToOne(() => Memos, memos => memos.memo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
