import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Memo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('timestamp')
    timestamp: Date;

    @Column('text')
    htmlContent: string;
} 