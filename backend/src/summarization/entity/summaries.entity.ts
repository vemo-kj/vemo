import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Summary } from './summarization.entity';

@Entity('summaries') // 전체 요약 테이블
export class Summaries {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    videoid: string; // 유튜브 비디오 ID

    @OneToMany(() => Summary, summary => summary.summaries, { cascade: true })
    summaries: Summary[]; // 개별 요약 리스트
}
