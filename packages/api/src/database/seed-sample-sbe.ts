import { Sbe } from '@edanalytics/models-server';
import { Logger } from '@nestjs/common';
import colors from 'colors/safe';
import config from 'config';
import 'reflect-metadata';
import { EntityManager } from 'typeorm';

export const seedSampleSbe = async (db: EntityManager) => {
  console.log('');
  Logger.log(colors.cyan('Seeding sample Starting Blocks environment.'));
  if (!config.SAMPLE_SBE_CONFIG) {
    throw new Error('Trying to seed sample SBE but SAMPLE_SBE_CONFIG not found.');
  }
  await db.getRepository(Sbe).save({
    configPrivate: {
      adminApiSecret: config.SAMPLE_SBE_CONFIG.adminApiSecret,
      sbeMetaSecret: config.SAMPLE_SBE_CONFIG.sbeMetaSecret,
    },
    configPublic: {
      hasOdsRefresh: false,
      adminApiKey: config.SAMPLE_SBE_CONFIG.adminApiKey,
      adminApiUrl: config.SAMPLE_SBE_CONFIG.adminApiUrl,
      sbeMetaKey: config.SAMPLE_SBE_CONFIG.sbeMetaKey,
      sbeMetaUrl: config.SAMPLE_SBE_CONFIG.sbeMetaUrl,
    },
    envLabel: 'test-env-label',
  });
  Logger.log(colors.cyan('Done.'));
  if (
    config.SAMPLE_SBE_CONFIG.adminApiSecret === '<ask bjorn, mark, or eshara>' ||
    config.SAMPLE_SBE_CONFIG.sbeMetaSecret === '<ask bjorn, mark, or eshara>'
  ) {
    Logger.warn(
      "It looks like you haven't configured all the sample SBE parameters. In order to connect to Starting Blocks you'll need to get the following things from Bjorn or Eshara and then use the app to give them to the SBE." +
        (config.SAMPLE_SBE_CONFIG.adminApiSecret === '<ask bjorn, mark, or eshara>'
          ? '\n- adminApiSecret'
          : '') +
        (config.SAMPLE_SBE_CONFIG.sbeMetaSecret === '<ask bjorn, mark, or eshara>'
          ? '\n- sbeMetaSecret'
          : '')
    );
  }
};
