import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TimestampList } from './timestamp_list.entity';

@Entity()
export class Timestamp {
    @PrimaryGeneratedColumn()
    timestampId: number;

    @Column('time')
    time: string;

    @Column({ length: 100 })
    description: string;

    @ManyToOne(() => TimestampList, timestamplist => timestamplist.timestamps)
    timestampList: TimestampList;
}
