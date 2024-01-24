import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Metadata {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    metadata: string;

    @Column()
    pinataCid: string;

    @CreateDateColumn()
    createdAt : string;

    @UpdateDateColumn()
    updatedAt : string;
}
