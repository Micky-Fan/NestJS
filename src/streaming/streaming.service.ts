import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class StreamingService {
  constructor(private http: HttpService) {}
  async getOhlc(currency_pair: string) {
    const request = this.http
      .get(`https://www.bitstamp.net/api/v2/ohlc/${currency_pair}/`, {
        params: {
          step: 3600,
          limit: 1,
        },
      })
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
    const response = await lastValueFrom(request);
    return response.data.ohlc;
  }
}
