import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tile } from 'src/tile/tile.entity';
import { MetadataController } from './metadata.controller';
import { Metadata } from './metadata.entity';
import { MetadataService } from './metadata.service';

@Module({
    imports: [TypeOrmModule.forFeature([Metadata, Tile])],
    controllers: [MetadataController],
    providers: [MetadataService],
    exports: [MetadataService]
})
export class MetadataModule {}
