import {
  User,
} from '@ts-app-base-se/models';
import { DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'sqlite',
  database: 'packages/api/db.sqlite',
  entities: [User],
  synchronize: true,
  migrations: ['packages/api/src/database/migrations/*.{ts,js}'],
};

export default config;
