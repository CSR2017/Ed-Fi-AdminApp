import { Edorg } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { throwNotFound } from '../../utils';

@Injectable()
export class EdorgsGlobalService {
  constructor(
    @InjectRepository(Edorg)
    private edorgsRepository: Repository<Edorg>
  ) {}

  findAll(sbeId: number) {
    return this.edorgsRepository.findBy({
      sbeId,
    });
  }

  findOne(sbeId: number, id: number) {
    return this.edorgsRepository
      .findOneByOrFail({
        sbeId,
        id,
      })
      .catch(throwNotFound);
  }
}
