import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TimestampList } from './timestamp_list.entity';

@Entity()
export class Timestamp {
    @PrimaryGeneratedColumn()
    timestampId: number;

    @Column('timestamp')
    time: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @ManyToOne(() => TimestampList, timestamplist => timestamplist.timestamps)
    timestampList: TimestampList;
}
