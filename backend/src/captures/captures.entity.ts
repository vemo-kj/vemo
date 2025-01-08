import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Memos } from '../memos/memos.entity';

@Entity()
export class Captures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('time')
    timestamp: string;

    @Column({ nullable: true }) // 업로드된 이미지 URL 저장
    image: string;

    @ManyToOne(() => Memos)
    @JoinColumn({ name: 'memosId' })
    memos: Memos;
}
