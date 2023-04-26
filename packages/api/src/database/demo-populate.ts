import { program } from 'commander'

program.option('-n, --noInteraction')
program.parse(process.argv)

const noInteraction = !!(program.opts()?.noInteraction)

import {
  GlobalRole,
  User
} from '@edanalytics/models';
import { generateFake } from '@edanalytics/utils';
import { faker } from '@faker-js/faker';
import { execSync } from 'child_process';
import colors from 'colors/safe';
import prompts from 'prompts';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import typeormConfig from './typeorm.config';

const db = new DataSource({ ...typeormConfig, synchronize: false });
async function populate() {
  await db.initialize();
  await db.synchronize(true);
  db.transaction(async (dataSource) => {
    let givenName: string | undefined;
    let familyName: string | undefined;
    let userName: string | undefined;

    if (noInteraction) {
      console.log(colors.yellow('Using placeholder user info'));

      givenName = "Testy"
      familyName = "McTestFace"
      userName = "testy@example.com"

    } else {
      try {
        try {
          [givenName, familyName] = execSync('net user %USERNAME% | findstr "Full Name"', { encoding: 'utf8' }).replace('Full Name', '').trim().split(' ')
        } catch (notWindows) {
          [givenName, familyName] = execSync(`git config --global user.name`, { encoding: 'utf8' }).trim().split(' ')
        }
      } catch (err) {
        // fallback to blank default
      }
      try {
        userName = execSync('git config --global user.email', { encoding: 'utf8' })?.trim();
        if (userName?.includes('github')) {
          // don't want the ugly default github email so fall back to computer username
          userName = execSync("echo %USERNAME%", { encoding: 'utf8' })?.trim()
        }
      } catch (err) {
        // fallback to blank default
      }

      const out = await prompts([
        {
          type: 'text',
          name: 'givenName',
          message: 'What is your given name?',
          validate: value => !value?.trim() ? `Please provide your given name.` : true,
          initial: givenName,
        },
        {
          type: 'text',
          name: 'familyName',
          message: 'What is your family name?',
          validate: value => !value?.trim() ? `Please provide your family name.` : true,
          initial: familyName,
        },
        {
          type: 'text',
          name: 'userName',
          message: 'What is your username?',
          validate: value => !value?.trim() ? `Please provide your username.` : true,
          initial: userName,
        },
      ]);

      givenName = out.givenName;
      familyName = out.familyName;
      userName = out.userName;
    }

    const userRepository = dataSource.getRepository(User);

    const me = await userRepository.save({
      username: userName,
      familyName: familyName,
      givenName: givenName,
      role: GlobalRole.Admin,
      isActive: true,
    });

    const otherUsers = await userRepository.save(
      generateFake(
        User,
        {
          createdBy: me,
        },
        13
      )
    );

    const users = [me, ...otherUsers];

    console.log(colors.green('\nDone.'));
  });
}
populate();
