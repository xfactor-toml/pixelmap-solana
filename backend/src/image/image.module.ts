import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tile } from 'src/tile/tile.entity';
import { ImageController } from './image.controller';
import { Image } from './image.entity';
import { ImageService } from './image.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Image, Tile])
    ],
    controllers: [ImageController],
    providers: [ImageService],
    exports: [ImageService]
})
export class ImageModule {}
