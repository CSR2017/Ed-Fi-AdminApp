import { IAppLauncher } from '@edanalytics/models';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppLauncher implements IAppLauncher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  clientId: string;

  @Column()
  poolId: string;
}
