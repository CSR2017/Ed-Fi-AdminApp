import { Expose, Type } from "class-transformer";
import { EdorgType } from "../enums";
import { SbeMeta } from "../types";

export class SbMetaEdorg {
  @Expose()
  educationorganizationid: number;

  @Expose()
  nameofinstitution: string;

  @Expose()
  discriminator: EdorgType;

  @Expose()
  @Type(() => SbMetaEdorg)
  edorgs?: SbMetaEdorg[]
}

export class SbMetaOds {
  @Expose()
  dbname: string;

  @Expose()
  @Type(() => SbMetaEdorg)
  edorgs?: SbMetaEdorg[]
}

export class SbMetaEnv {
  @Expose()
  envlabel: string;

  @Expose()
  meta: SbeMeta;

  @Expose()
  @Type(() => SbMetaOds)
  odss?: SbMetaOds[]
}