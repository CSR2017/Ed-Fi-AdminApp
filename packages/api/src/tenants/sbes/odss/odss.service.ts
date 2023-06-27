import { Ods } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OdssService {
  constructor(
    @InjectRepository(Ods)
    private odssRepository: Repository<Ods>
  ) {}

  async findAll(sbeId: number) {
    return this.odssRepository.findBy({ sbeId });
  }

  findOne(id: number) {
    return this.odssRepository.findOneBy({ id });
  }
}
