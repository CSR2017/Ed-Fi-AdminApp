import { User } from '@ts-app-base-se/models';
import { DataSource } from 'typeorm';
import typeormConfig from './typeorm.config';

export default new DataSource({
  ...typeormConfig,
  synchronize: false,
});
