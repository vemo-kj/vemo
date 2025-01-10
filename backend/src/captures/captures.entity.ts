import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity('captures')
export class Captures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('time')
    timestamp: string;

    @Column({ nullable: true })
    image: string;

    @ManyToOne(() => Memos)
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
