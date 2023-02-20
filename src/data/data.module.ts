import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
