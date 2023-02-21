import { OnModuleInit } from '@nestjs/common';
import { WebSocket } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'streaming' })
export class StreamingGateway implements OnModuleInit {
  public bitstampWs;
  constructor() {
    this.bitstampWs = new WebSocket('wss://ws.bitstamp.net.');
  }
  @WebSocketServer()
  server: Server;
  onModuleInit() {
    // connect bitstamp
    this.bitstampWs.on('open', () => {
      console.log('connect');
    });
    this.bitstampWs.on('error', console.error);

    this.server.on('connect', (socket) => {
      console.log('socket id', socket.id);
      console.log('connected');
    });
  }

  @SubscribeMessage('subscribe')
  subscribe(@MessageBody() currencyPair: string) {
    const subscribeObj = {
      event: 'bts:subscribe',
      data: {
        channel: `live_orders_${currencyPair}`,
      },
    };
    this.bitstampWs.send(JSON.stringify(subscribeObj));
    this.bitstampWs.on('message', (message) => {
      const data = JSON.parse(message);
      this.server.emit('price', {
        price: data.data.price,
      });
    });
  }
  @SubscribeMessage('unsubscribe')
  unsubscibe(@MessageBody() currencyPair: string) {
    const subscribeObj = {
      event: 'bts:unsubscribe',
      data: {
        channel: `live_orders_${currencyPair}`,
      },
    };
    this.bitstampWs.send(JSON.stringify(subscribeObj));
    this.bitstampWs.on('message', (message: string) => {
      const data = JSON.parse(message);
      this.server.emit('price', {
        price: data.data.price,
      });
    });
  }
