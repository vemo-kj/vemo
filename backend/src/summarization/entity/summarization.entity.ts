import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Summaries } from './summaries.entity';

// 개별 요약 테이블
@Entity('summary')
export class Summary {
    @PrimaryGeneratedColumn()
    id: number;

    // Date 타입으로 변경
    @Column({ type: 'time' })
    timestamp: Date;

    // Date 타입으로 변경
    @Column({ length: 255 })
    summary: string;

    @ManyToOne(() => Summaries, summaries => summaries.summaries, { onDelete: 'CASCADE' })
    summaries: Summaries;
}
