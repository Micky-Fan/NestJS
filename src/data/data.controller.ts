import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DataService } from './data.service';
import { userThrottlerGuard } from './user.throttler.guard';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}
  @UseGuards(userThrottlerGuard)
  @Get()
  async getHackerNews(@Query('user') id: number) {
    console.log('id==>', id);
    return this.dataService.getHackerNews();
  }
}
