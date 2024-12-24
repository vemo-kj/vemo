import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Timestamp } from './timestamp.entity';

@Entity()
export class TimestampList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    videoId: string;

    @OneToMany(() => Timestamp, timestamp => timestamp.timestampList)
    timestamps: Timestamp[];
}
