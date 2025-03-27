import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePrivileges1719427712090 implements MigrationInterface {
  name = 'AddProfilePrivileges1719427712090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Add profile privileges manually to roles');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('down');
  }
}
