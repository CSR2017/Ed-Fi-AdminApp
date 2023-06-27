import { Edorg, Sbe } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EdorgsService {
  constructor(
    @InjectRepository(Edorg)
    private edorgsRepository: Repository<Edorg>
  ) {}

  findAll(sbeId: Sbe['id']) {
    return this.edorgsRepository.findBy({ sbeId });
  }

  findOne(id: number) {
    return this.edorgsRepository.findOneBy({ id });
  }
}
