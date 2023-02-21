import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { HttpModule } from '@nestjs/axios';
import { StreamingGateway } from './streaming/streaming.gateway';
import { StreamingService } from './streaming/streaming.service';

@Module({
  imports: [HttpModule, DataModule],
  controllers: [AppController],
  providers: [AppService, StreamingGateway, StreamingService],
})
export class AppModule {}
