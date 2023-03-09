import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { HttpModule } from '@nestjs/axios';
import { StreamingModule } from './streaming/streaming.module';

@Module({
  imports: [HttpModule, DataModule, StreamingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
