import { Controller, Req, Post, Get } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ImageService } from 'src/image/image.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { Tile } from './tile.entity';
import { TileService } from './tile.service';

@Controller('tile')
export class TileController {
    constructor(
        private tileService: TileService,
        private metadataService: MetadataService,
        private imageService: ImageService,
    ) { }

    @Post('/update')
    async update(@Req() req) {
        const {
            tileId,

            imageCid,
            metadataCid,

            nftAddress,
            metaName,
            metaLink,
            metaDescription,
            saleOwner,
            salePrice,
            updater
        } = req.body;

        const existingImage = await this.imageService.findByCid(imageCid);
        const existingMetadata = await this.metadataService.findByCid(metadataCid);

        if(existingImage && existingMetadata) {
            const existingTile = await this.tileService.findByTileId(tileId);

            const data = {
                tileId,
                nftAddress,
                metaName,
                metaLink,
                metaDescription,
                saleOwner,
                salePrice,
                nftImage: existingImage.id,
                nftMetadata: existingMetadata.id,
                updater
            };

            
            if(!existingTile)  {
                await this.tileService.insert(data);
            } else {
                await this.tileService.update(existingTile.id, data);
            }
        }
    }

    @Get()
    async getAll(): Promise<Tile[]> {
        return await this.tileService.getAll();
    }

    @Post('/list')
    async list(@Req() req) {
        const { tileId, salePrice, saleOwner } = req.body;
        
        await this.tileService.list(tileId, salePrice, saleOwner);
    }

    @Post('/unlist')
    async unlist(@Req() req) {
        const { tileId } = req.body;

        await this.tileService.unlist(tileId);
    }

    @Cron("*/6 * * * * *")
    async clean() {
        const image = await this.imageService.getRedundant();

        // console.log(image);

        if(image) {
            const updatedTime = new Date(image.updatedAt).getTime();

            // console.log(Date.now() - updatedTime);

            if(Date.now() - updatedTime > 1000 * 60 * 10) {
                await this.imageService.remove(image.pinataCid);

                return;
            }
        }

        const metadata = await this.metadataService.getRedundant();

        // console.log(metadata);

        if(metadata) {
            const updatedTime = new Date(metadata.updatedAt).getTime();

            // console.log(Date.now() - updatedTime);

            if(Date.now() - updatedTime > 1000 * 60 * 10) {
                await this.metadataService.remove(metadata.pinataCid);

                return;
            }
        }

    }
}