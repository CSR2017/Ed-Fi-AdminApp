import { Logger, Module } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import config from 'config';
import { EntityManager } from 'typeorm';
import { seedDemoData } from './seed-demo-data';
import { seedRoles } from './seed-roles';
import { seedIdps } from './seed-idps';
import { seedSampleSbe } from './seed-sample-sbe';
import { wait } from '@edanalytics/utils';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class SeedModule {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {
    (async () => {
      await wait(500);
      const rolesCount = await entityManager.query(
        `SELECT SUM("count")
          FROM (
            SELECT COUNT(*)
            FROM "role"
            UNION ALL
            SELECT COUNT(*)
            FROM role_privileges_privilege
          ) tbl`
      );
      const rows = Number(rolesCount[0].sum);
      if (rows !== 0) return;
      await seedRoles(entityManager);

      const idpsCount = await entityManager.query(
        `SELECT SUM("count")
            FROM (
              SELECT COUNT(*)
              FROM oidc
              UNION ALL
              SELECT COUNT(*)
              FROM app_launcher
            ) tbl`
      );
      if (config.SAMPLE_OIDC_CONFIG || config.SAMPLE_APP_LAUNCHER_CONFIG) {
        const rows = Number(idpsCount[0].sum);
        if (rows !== 0) return;
        await seedIdps(entityManager);
      } else {
        Logger.warn(
          "It looks like you don't have any IdPs configured. " +
            "In order to log in to the app you'll need to set " +
            "one up in the 'oidc' table and then restart the server. " +
            'See `local-development.js.copyme` for an example.'
        );
      }
      if (config.SAMPLE_SBE_CONFIG) {
        const sbesCount = await entityManager.query(
          `SELECT SUM("count")
            FROM (
              SELECT COUNT(*)
              FROM sbe
            ) tbl`
        );
        const rows = Number(sbesCount[0].sum);
        if (rows !== 0) return;
        await seedSampleSbe(entityManager);
      }

      if (config.SEED_DEMO_DATA) {
        const dataCount = await entityManager.query(
          `SELECT SUM("count")
            FROM (
              SELECT COUNT(*)
              FROM "user"
              UNION ALL
              SELECT COUNT(*)
              FROM tenant
            ) tbl`
        );
        const rows = Number(dataCount[0].sum);
        if (rows !== 0) return;
        await seedDemoData(entityManager);
      }
    })();
  }
}
