import { GetUserDto, PostOdsDto, PutOdsDto } from '@edanalytics/models';
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

  create(createOdsDto: PostOdsDto) {
    return this.odssRepository.save(this.odssRepository.create(createOdsDto));
  }

  async findAll(sbeId: number) {
    return this.odssRepository.findBy({ sbeId });
  }

  findOne(id: number) {
    return this.odssRepository.findOneBy({ id });
  }

  async update(id: number, updateOdsDto: PutOdsDto) {
    const old = await this.findOne(id);
    return this.odssRepository.save({ ...old, ...updateOdsDto });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.odssRepository.save({
      ...old,
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
