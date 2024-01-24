import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './image.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as FormData from "form-data";
import { Tile } from 'src/tile/tile.entity';
import { TileService } from 'src/tile/tile.service';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image) private imageRepository: Repository<Image>,
        @InjectRepository(Tile) private tileRepository: Repository<Tile>,
        private configService: ConfigService
    ) { }

    async insert(base64Data: string): Promise<string> {
        try {
            const existingImage = await this.imageRepository.findOneBy({ base64Data });
    
            if(existingImage) {
                return existingImage.pinataCid;
            }
    
            const base64_only = base64Data.split('base64,').pop();
            const base64_buffer = Buffer.from(base64_only, "base64");
            const formData = new FormData();
    
            formData.append('file', base64_buffer, 'tile.png');
    
            const res = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': this.configService.get('PINATA_KEY'),
                    'pinata_secret_api_key': this.configService.get('PINATA_SECRET'),
                    "Content-Type": "multipart/form-data"
                },
            });
    
            const pinataCid: string = res.data.IpfsHash;
    
            const newImage = this.imageRepository.create({
                base64Data,
                pinataCid,
            });
    
            await this.imageRepository.save(newImage);
    
            return newImage.pinataCid;
        } catch(error) {
            console.log(error);
        }
    }

    async remove(pinataCid: string) {
        const existingImage = await this.imageRepository.findOneBy({ pinataCid });
        
        if(existingImage) {
            const existingTile = await this.tileRepository.findOneBy({ nftImage: existingImage });

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

        try{
            if(existingImage) {
                await this.imageRepository.delete(existingImage.id);
            }
        } catch(error) {
            // console.log(error);
        }
    }

    async findByCid(pinataCid: string): Promise<Image> {
        return await this.imageRepository.findOneBy({ pinataCid });
    }

    async getRedundant(): Promise<Image> {
        return await this.imageRepository.createQueryBuilder('image')
            .leftJoinAndSelect('tile', 'tile', 'image.id=tile.nftImageId')
            .where('tile.tileId IS NULL')
            .select(['image.id', 'image.updatedAt', 'image.pinataCid'])
            .getOne();
    }
}