import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Summaries } from './summaries.entity';

@Entity('summary') // 개별 요약 테이블
export class Summary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    timestamp: Date; // Date 타입으로 변경

    @Column({ type: 'text' })
    summary: string; // 요약 내용

    @ManyToOne(() => Summaries, summaries => summaries.summaries, { onDelete: 'CASCADE' })
    summaries: Summaries; // 어떤 비디오 요약에 속하는지
}
