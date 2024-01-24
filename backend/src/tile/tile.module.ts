import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageModule } from 'src/image/image.module';
import { MetadataModule } from 'src/metadata/metadata.module';
import { TileController } from './tile.controller';
import { Tile } from './tile.entity';
import { TileService } from './tile.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tile]),
        MetadataModule,
        ImageModule
    ],
    controllers: [TileController],
    providers: [TileService],
})
export class TileModule {}
