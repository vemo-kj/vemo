import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TimestampList } from './timestamp_list.entity';

@Entity()
export class Timestamp {
    @PrimaryGeneratedColumn()
    timestampId: number;

    // 타임 스탬프 시간
    @Column('time')
    time: string;

    // 메모
    @Column({ length: 100 })
    description: string;

    // 다대일 관계 설정
    @ManyToOne(() => TimestampList, timestampList => timestampList.timestamps)
    timestampList: TimestampList;
}
