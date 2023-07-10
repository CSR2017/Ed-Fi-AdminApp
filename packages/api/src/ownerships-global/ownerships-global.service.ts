import { GetUserDto, PostOwnershipDto, PutOwnershipDto } from '@edanalytics/models';
import { Ownership } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OwnershipsGlobalService {
  constructor(
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}
  create(createOwnershipDto: PostOwnershipDto) {
    return this.ownershipsRepository.save(this.ownershipsRepository.create(createOwnershipDto));
  }

  async findOne(id: number) {
    return this.ownershipsRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateOwnershipDto: PutOwnershipDto) {
    const old = await this.findOne(id);
    return this.ownershipsRepository.save({ ...old, ...updateOwnershipDto });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.ownershipsRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
