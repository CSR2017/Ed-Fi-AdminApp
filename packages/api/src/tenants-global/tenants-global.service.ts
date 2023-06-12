import { GetUserDto, PostTenantDto, PutTenantDto } from '@edanalytics/models';
import { Tenant } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TenantsGlobalService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}
  create(createTenantDto: PostTenantDto) {
    return this.tenantsRepository.save(
      this.tenantsRepository.create(createTenantDto)
    );
  }

  async findOne(id: number) {
    return this.tenantsRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateTenantDto: PutTenantDto) {
    const old = await this.findOne(id);
    return this.tenantsRepository.save({ ...old, ...updateTenantDto });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.tenantsRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
