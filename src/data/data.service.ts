import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, catchError, lastValueFrom } from 'rxjs';

@Injectable()
export class DataService {
  constructor(private http: HttpService) {}
  async getHackerNews() {
    const request = this.http
      .get('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty')
      .pipe(map((res) => res.data))
      .pipe(
        catchError(() => {
          throw new HttpException(
            {
              code: HttpStatus.BAD_REQUEST,
              msg: 'API is not available',
            },
            HttpStatus.BAD_REQUEST,
          );
        }),
      );
    const hackerNews = await lastValueFrom(request);
    return {
      result: hackerNews,
    };
  }
}
