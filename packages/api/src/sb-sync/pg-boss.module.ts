import { Global, Injectable, Module } from '@nestjs/common';
import PgBoss from 'pg-boss';
import * as config from 'config';

@Injectable()
export class PgBossInstance extends PgBoss {
  async onApplicationShutdown() {
    await this.stop({ graceful: false, destroy: true });
  }
}
@Global()
@Module({
  providers: [
    {
      provide: 'PgBossInstance',
      useFactory: async () => {
        const str = await config.DB_CONNECTION_STRING;

        const boss = new PgBossInstance({
          connectionString: str,
        });
        await boss.start();
        return boss;
      },
    },
  ],
  exports: [
    {
      useExisting: 'PgBossInstance',
      provide: 'PgBossInstance',
    },
  ],
})
export class PgBossModule {}
