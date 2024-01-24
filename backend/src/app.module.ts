import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TileModule } from './tile/tile.module';
import { ImageModule } from './image/image.module';
import { ConfigModule } from '@nestjs/config';
import { MetadataModule } from './metadata/metadata.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 50,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/solwalla.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TileModule,
    ImageModule,
    MetadataModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
