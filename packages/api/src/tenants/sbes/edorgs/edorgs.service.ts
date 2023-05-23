import { GetUserDto, PostEdorgDto, PutEdorgDto } from '@edanalytics/models';
import { Edorg, Ownership, Sbe } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OdssService } from '../odss/odss.service';
import { SbesService } from '../sbes.service';

@Injectable()
export class EdorgsService {
  constructor(
    @InjectRepository(Edorg)
    private edorgsRepository: Repository<Edorg>,
    @InjectEntityManager()
    private em: EntityManager,
    private readonly sbesService: SbesService,
    private readonly odssService: OdssService,
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>
  ) {}

  create(createEdorgDto: PostEdorgDto) {
    return this.edorgsRepository.save(
      this.edorgsRepository.create(createEdorgDto)
    );
  }

  findAll(sbeId: Sbe['id']) {
    return this.edorgsRepository.findBy({ sbeId });
  }

  findOne(id: number) {
    return this.edorgsRepository.findOneBy({ id });
  }

  async update(id: number, updateEdorgDto: PutEdorgDto) {
    const old = await this.findOne(id);
    return this.edorgsRepository.save({ ...old, ...updateEdorgDto });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.edorgsRepository.save({
      ...old,
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
