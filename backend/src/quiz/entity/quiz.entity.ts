import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Quizzes } from './quizzes.entity';

@Entity('quiz') // 테이블명 설정
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    // Date 타입으로 변경
    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column('text')
    question: string; // 퀴즈 문제

    @Column()
    answer: string; // O / X (정답)

    // quizs 테이블의 ID와 연결
    @ManyToOne(() => Quizzes, quizzes => quizzes.quizzes, { onDelete: 'CASCADE' })
    quizzes: Quizzes;
}
