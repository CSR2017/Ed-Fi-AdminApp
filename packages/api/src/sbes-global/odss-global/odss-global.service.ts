import { Ods } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { throwNotFound } from '../../utils';

@Injectable()
export class OdssGlobalService {
  constructor(
    @InjectRepository(Ods)
    private odssRepository: Repository<Ods>
  ) {}

  findAll(sbeId: number) {
    return this.odssRepository.findBy({
      sbeId,
    });
  }

  findOne(sbeId: number, id: number) {
    return this.odssRepository
      .findOneByOrFail({
        sbeId,
        id,
      })
      .catch(throwNotFound);
  }
}
