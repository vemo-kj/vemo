
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity('Memo')
export class Memo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    timestamp: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @ManyToOne(() => Memos, memos => memos.memos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
