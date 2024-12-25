import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Memo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    memosId: string;

    @Column('varchar', { length: 100 })
    timestamp: string;

    @Column({ length: 1000, nullable: true })
    description: string;
}
