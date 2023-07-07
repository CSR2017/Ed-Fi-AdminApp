import { AppLauncher, Oidc } from '@edanalytics/models-server';
import { Logger } from '@nestjs/common';
import colors from 'colors/safe';
import config from 'config';
import 'reflect-metadata';
import { EntityManager } from 'typeorm';

export const seedIdps = async (db: EntityManager) => {
  console.log('');
  Logger.log(colors.cyan('Seeding IdPs.'));
  let newIdps = false;
  if (config.SAMPLE_OIDC_CONFIG) {
    await db.getRepository(Oidc).save(config.SAMPLE_OIDC_CONFIG);
    Logger.log(colors.cyan('- OIDC Identity Provider.'));
    newIdps = true;
  }

  if (config.SAMPLE_APP_LAUNCHER_CONFIG) {
    await db.getRepository(AppLauncher).save(config.SAMPLE_APP_LAUNCHER_CONFIG);
    Logger.log(colors.cyan('- App launcher.'));
    newIdps = true;
  }

  Logger.log(colors.cyan('Done.'));
  if (newIdps) {
    console.log('');
    Logger.warn(
      'After adding new identity providers you need to restart the application in order to mount them.'
    );

    Logger.error('Please restart your app server to mount new IdPs.');
  }
};
