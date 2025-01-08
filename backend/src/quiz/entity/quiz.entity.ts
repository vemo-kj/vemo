import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quizzes } from './quizzes.entity';

@Entity('quiz') // 테이블명 설정
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    // Date 타입으로 변경
    @Column({ type: 'time' })
    timestamp: Date;

    @Column({ length: 100 })
    question: string; // 퀴즈 문제

    @Column({ length: 100 })
    answer: string; // O / X (정답)

    // quizs 테이블의 ID와 연결
    @ManyToOne(() => Quizzes, quizzes => quizzes.quizzes, { onDelete: 'CASCADE' })
    quizzes: Quizzes;
}
