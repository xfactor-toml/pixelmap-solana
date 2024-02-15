import {
    Entity,
    JoinColumn,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { Image } from 'src/image/image.entity';
import { Metadata } from 'src/metadata/metadata.entity';

@Entity()
export class Tile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tileId: number;

    @ManyToOne(type => Image, nftImage => nftImage.id)
    @JoinColumn()
    nftImage: Image

    @ManyToOne(type => Metadata, nftMetadata => nftMetadata.id)
    @JoinColumn()
    nftMetadata: Metadata

    @Column()
    nftAddress: string;

    @Column()
    metaName: string;

    @Column()
    metaLink: string;

    @Column()
    metaDescription: string;

    @Column()
    saleOwner: string;

    @Column()
    salePrice: number;

    @Column()
    updater: string;
}
