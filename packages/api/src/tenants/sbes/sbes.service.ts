import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto, PostSbeDto, PutSbeDto } from '@edanalytics/models';
import { In, Repository } from 'typeorm';
import { throwNotFound } from '../../utils';
import _ from 'lodash';
import { Sbe, Ownership } from '@edanalytics/models-server';

@Injectable()
export class SbesService {
  constructor(
    @InjectRepository(Sbe)
    private sbesRepository: Repository<Sbe>,
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>
  ) {}
  create(createSbeDto: PostSbeDto) {
    return this.sbesRepository.save(this.sbesRepository.create(createSbeDto));
  }

  async findOne(id: number) {
    return this.sbesRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateSbeDto: PutSbeDto) {
    const old = await this.findOne(id);
    return this.sbesRepository.save({ ...old, ...updateSbeDto });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.sbesRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
