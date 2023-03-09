import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BitstampService } from '../socket/bitstamp.service';

@Injectable()
export class StreamingService {
  private readonly subject = new Subject<any>();
  private readonly subjects: Map<string, any> = new Map();
  private tradeDataMap = new Map();
  constructor(private readonly bitstampService: BitstampService) {}

  subscribe(currencyPair: string, ws: WebSocket) {
    this.bitstampService.getWebSocket().on('message', (message) => {
      const data = JSON.parse(message.toString());
      if (data.channel?.includes(currencyPair)) {
        const price = Number(data.data.price);
        const timestamp = Number(data.data.timestamp);
        // add the trade data to the corresponding currency pair
        const tradeData = this.tradeDataMap.get(currencyPair) || [];
        tradeData.push({
          price,
          timestamp,
        });
        this.tradeDataMap.set(currencyPair, tradeData);

        // calculate OHLC data
        const ohlcData = this.getOHLCData(currencyPair);
        this.subject.next({
          event: 'trade',
          channel: data.channel,
          data: {
            price,
            open: ohlcData[0],
            high: ohlcData[1],
            low: ohlcData[2],
            close: ohlcData[3],
          },
        });
        const subject = new Subject<any>();

        const subscription = subject.subscribe({
          next: (data) => {
            ws.send(JSON.stringify(data));
          },
          error: (error) => {
            console.error(error);
          },
          complete: () => {
            console.log('complete');
          },
        });
        this.subjects.set(currencyPair, subscription);
      }
    });
  }

  unsubscribe(currencyPair: string) {
    const subscription = this.subjects.get(currencyPair);
    subscription.unsubscribe();
  }

  getOHLCData(currencyPair: string): number[] {
    const tradeData = this.tradeDataMap.get(currencyPair);
    if (!tradeData) {
      return [0, 0, 0, 0];
    }

    // 1 min
    const timestamp = Math.floor(Date.now() / 60000);
    const ohlc: [number, number, number, number] = [
      0,
      0,
      Number.POSITIVE_INFINITY,
      0,
    ];

    for (const trade of tradeData) {
      const tradeTimestamp = Math.floor(trade.timestamp / 60);
      if (tradeTimestamp !== timestamp) {
        continue;
      }

      if (ohlc[0] === 0) {
        ohlc[0] = trade.price; // open
      }

      if (trade.price > ohlc[1]) {
        ohlc[1] = trade.price; // high
      }

      if (trade.price < ohlc[2]) {
        ohlc[2] = trade.price; // low
      }

      ohlc[3] = trade.price; // close
    }

    return ohlc;
  }

  addObserver(currencyPair, observer: WebSocket) {
    const subject = new Subject<any>();

    const subscription = subject.subscribe({
      next: (data) => {
        observer.send(JSON.stringify(data));
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('complete');
      },
    });
    this.subjects.set(currencyPair, subscription);
  }

  removeObserver(currencyPair: string) {
    const subject = this.subjects.get(currencyPair);
    subject.unsubscribe();
  }
}
