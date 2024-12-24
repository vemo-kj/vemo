import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Timestamp } from './timestamp.entity';

@Entity()
export class TimestampList {
    @PrimaryGeneratedColumn()
    id: number;

    // 비디오 ID
    @Column({ length: 50 })
    videoId: string;

    // 일대다 관계 설정
    @OneToMany(() => Timestamp, timestamp => timestamp.timestampList)
    timestamps: Timestamp[];
}
