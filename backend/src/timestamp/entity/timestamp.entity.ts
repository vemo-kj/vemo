import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TimestampList } from './timestamp_list.entity';

@Entity()
export class Timestamp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('time')
    time: string;

    @Column({ length: 100 })
    description: string;

    @ManyToOne(() => TimestampList, timestampList => timestampList.timestamps, {
        onDelete: 'CASCADE', // 옵션 (필요시)
        nullable: false, // 필수 참조 필드
    })
    timestampList: TimestampList;
}
