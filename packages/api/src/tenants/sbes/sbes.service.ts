import { Sbe } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SbesService {
  constructor(
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>
  ) {}

  async findOne(id: number) {
    return this.sbesRepository.findOneByOrFail({ id });
  }
}
