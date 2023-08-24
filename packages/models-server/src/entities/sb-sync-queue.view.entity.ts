import { ISbSyncQueue, PgBossJobState } from '@edanalytics/models';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
  select "id",
       "name",
       "priority",
       "data",
       "state",
       "retrylimit",
       "retrycount",
       "retrydelay",
       "retrybackoff",
       "startafter",
       "startedon",
       "singletonkey",
       "singletonon",
       "expirein",
       "createdon",
       "completedon",
       "keepuntil",
       "on_complete",
       "output",
       "archivedon"
from pgboss.archive
where name = 'sbe-sync'
union all
select "id",
       "name",
       "priority",
       "data",
       "state",
       "retrylimit",
       "retrycount",
       "retrydelay",
       "retrybackoff",
       "startafter",
       "startedon",
       "singletonkey",
       "singletonon",
       "expirein",
       "createdon",
       "completedon",
       "keepuntil",
       "on_complete",
       "output",
       null "archivedon"
from pgboss.job
where name = 'sbe-sync'
  `,
})
export class SbSyncQueue implements ISbSyncQueue {
  @ViewColumn()
  id: string;
  @ViewColumn()
  name: string;
  @ViewColumn()
  priority: number;
  @ViewColumn()
  data: object;
  @ViewColumn()
  state: PgBossJobState;
  @ViewColumn()
  retrylimit: number;
  @ViewColumn()
  retrycount: number;
  @ViewColumn()
  retrydelay: number;
  @ViewColumn()
  retrybackoff: boolean;
  @ViewColumn()
  startafter: Date;
  @ViewColumn()
  startedon: Date;
  @ViewColumn()
  singletonkey: string;
  @ViewColumn()
  singletonon: Date | null;
  @ViewColumn()
  expirein: Date;
  @ViewColumn()
  createdon: Date;
  @ViewColumn()
  completedon: Date;
  @ViewColumn()
  keepuntil: Date;
  @ViewColumn()
  on_complete: boolean;
  @ViewColumn()
  output: object;
  @ViewColumn()
  archivedon: Date | null;
}
