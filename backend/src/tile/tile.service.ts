import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tile } from './tile.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TileService {
    constructor(
        @InjectRepository(Tile) private tileRepository: Repository<Tile>,
        private configService: ConfigService
    ) { }

    async insert(data: any) {
        try {
            const newTile = this.tileRepository.create(data);

            await this.tileRepository.save(newTile);
        } catch(error) {
            console.log(error);
        }
    }

    async update(id: number, data: any) {
        try {
            await this.tileRepository.update(id, data);
        } catch(error) {
            console.log(error);
        }
    }

    async findByTileId(tileId: number): Promise<Tile> {
        return await this.tileRepository.findOneBy({ tileId });
    }

    async getAll(): Promise<Tile[]> {
        return await this.tileRepository.find({ relations: ['nftImage', 'nftMetadata'] });
    }

    async list(tileId: number, salePrice: number, saleOwner: string) {
        const existingTile = await this.findByTileId(tileId);

        if(existingTile) {
            return await this.tileRepository.update(existingTile.id, { saleOwner, salePrice });
        }
    }

    async unlist(tileId: number) {
        const existingTile = await this.findByTileId(tileId);

        if(existingTile) {
            return await this.tileRepository.update(existingTile.id, { saleOwner: '', salePrice: 0 });
        }
    }
}