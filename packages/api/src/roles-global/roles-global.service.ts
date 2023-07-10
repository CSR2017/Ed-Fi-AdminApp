import { GetUserDto, PostRoleDto, PutRoleDto } from '@edanalytics/models';
import { Role } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class RolesGlobalService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}
  create(createRoleDto: PostRoleDto) {
    return this.rolesRepository.save(this.rolesRepository.create(createRoleDto));
  }

  async findOne(id: number) {
    return this.rolesRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateRoleDto: PutRoleDto) {
    const old = await this.findOne(id);
    return this.rolesRepository.save({ ...old, ...updateRoleDto });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.rolesRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
