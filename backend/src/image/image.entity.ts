import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    base64Data: string;

    @Column()
    pinataCid: string;

    @CreateDateColumn()
    createdAt : string;

    @UpdateDateColumn()
    updatedAt : string;
}
