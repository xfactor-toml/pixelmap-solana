import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Metadata } from './metadata.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Tile } from 'src/tile/tile.entity';

@Injectable()
export class MetadataService {
    constructor(
        @InjectRepository(Metadata) private metadataRepository: Repository<Metadata>,
        @InjectRepository(Tile) private tileRepository: Repository<Tile>,
        private configService: ConfigService
    ) { }

    async insert(metadata: string): Promise<string> {
        try {
            const existingMetadata = await this.metadataRepository.findOneBy({ metadata });
    
            if(existingMetadata) {
                return existingMetadata.pinataCid;
            }

            const data = JSON.parse(metadata);

            const res = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data,
                headers: {
                    'pinata_api_key': this.configService.get('PINATA_KEY'),
                    'pinata_secret_api_key': this.configService.get('PINATA_SECRET'),
                    "Content-Type": "application/json"
                },
            });

            const pinataCid: string = res.data.IpfsHash;

            const newMetadata = this.metadataRepository.create({
                metadata,
                pinataCid,
            });

            await this.metadataRepository.save(newMetadata);
    
            return newMetadata.pinataCid;
        } catch(error) {
            console.log(error);
        }
    }

    async remove(pinataCid: string) {
        const existingMetadata = await this.metadataRepository.findOneBy({ pinataCid });

        if(existingMetadata) {
            const existingTile = await this.tileRepository.findOneBy({ nftMetadata: existingMetadata });

            // invalid remove
            if(existingTile) return;
        }

        try{
            await axios({
                method: "delete",
                url: `https://api.pinata.cloud/pinning/unpin/${pinataCid}`,
                headers: {
                    'Authorization': `Bearer ${this.configService.get('PINATA_JWT')}`
                }
            });
        } catch(error) {
            // console.log(error);
        }

        try {            
            if(existingMetadata) {
                await this.metadataRepository.delete(existingMetadata.id);
            }
        } catch(error) {
            // console.log(error);
        }
        
    }

    async findByCid(pinataCid: string): Promise<Metadata> {
        return await this.metadataRepository.findOneBy({ pinataCid });
    }

    async getRedundant(): Promise<Metadata> {
        return await this.metadataRepository.createQueryBuilder('metadata')
            .leftJoinAndSelect('tile', 'tile', 'metadata.id=tile.nftMetadataId')
            .where('tile.tileId IS NULL')
            .select(['metadata.id', 'metadata.updatedAt', 'metadata.pinataCid'])
            .getOne();
    }
}