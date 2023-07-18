import { Expose, Type } from 'class-transformer';
import { EdorgType } from '../enums';

export class SbMetaEdorg {
  @Expose()
  educationorganizationid: number;

  @Expose()
  nameofinstitution: string;

  @Expose()
  shortnameofinstitution: string;

  @Expose()
  discriminator: EdorgType;

  @Expose()
  @Type(() => SbMetaEdorg)
  edorgs?: SbMetaEdorg[];
}

export class SbMetaOds {
  @Expose()
  dbname: string;

  @Expose()
  @Type(() => SbMetaEdorg)
  edorgs?: SbMetaEdorg[];
}

export class SbMetaEnv {
  @Expose()
  envlabel: string;

  @Expose()
  domainName: string;

  @Expose()
  @Type(() => SbMetaOds)
  odss?: SbMetaOds[];
}
