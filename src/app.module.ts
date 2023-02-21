import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { StreamingGateway } from './streaming/streaming.gateway';

@Module({
  imports: [HttpModule, DataModule],
  controllers: [AppController],
  providers: [AppService, StreamingGateway],
})
export class AppModule {}
