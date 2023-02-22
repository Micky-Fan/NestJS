import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class userThrottlerGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const id = req.query.user;
    const ip = req.connection.remoteAddress;
    const idKey = this.generateKey(context, id);
    const ipKey = this.generateKey(context, ip);
    const idStorage = await this.storageService.increment(idKey, 60);
    const ipStorage = await this.storageService.increment(ipKey, 60);
    if (idStorage.totalHits > 5 || ipStorage.totalHits > 10) {
      throw new HttpException(
        { ip: ipStorage.totalHits, id: idStorage.totalHits },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
