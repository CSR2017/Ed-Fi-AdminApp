import { Global, Injectable, Module } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class CacheService extends NodeCache {}

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
