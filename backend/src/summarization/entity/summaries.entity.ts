import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Summary } from './summarization.entity';

// 전체 요약 테이블
@Entity('summaries')
export class Summaries {
    @PrimaryGeneratedColumn()
    id: number;

    // 유튜브 비디오 ID
    @Column()
    videoid: string;

    // 개별 요약 리스트
    @OneToMany(() => Summary, summary => summary.summaries, { cascade: true })
    summaries: Summary[];
}
