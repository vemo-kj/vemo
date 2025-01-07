import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity()
export class Captures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('datetime')
    timestamp: Date;

    @Column('text')
    image: string;

    @ManyToOne(() => Memos)
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
