import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Quiz } from './quiz.entity';

@Entity('quizzes') // 테이블명 설정
export class Quizzes {
    @PrimaryGeneratedColumn()
    id: number;

    // 유튜브 비디오 ID
    @Column()
    videoid: string;

    // 여러 개의 퀴즈 항목
    @OneToMany(() => Quiz, quiz => quiz.quizzes, { cascade: true })
    quizzes: Quiz[];
}
