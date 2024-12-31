import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Summaries } from './summaries.entity';

// 개별 요약 테이블
@Entity('summary')
export class Summary {
    @PrimaryGeneratedColumn()
    id: number;

    // Date 타입으로 변경
    @Column({ type: 'timestamp' })
    timestamp: Date;

    // Date 타입으로 변경
    @Column({ type: 'text' })
    summary: string;

    @ManyToOne(() => Summaries, summaries => summaries.summaries, { onDelete: 'CASCADE' })
    summaries: Summaries;
}
