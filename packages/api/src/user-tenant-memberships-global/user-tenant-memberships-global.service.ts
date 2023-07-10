import {
  GetUserDto,
  PostUserTenantMembershipDto,
  PutUserTenantMembershipDto,
} from '@edanalytics/models';
import { UserTenantMembership } from '@edanalytics/models-server';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserTenantMembershipsGlobalService {
  constructor(
    @InjectRepository(UserTenantMembership)
    private userTenantMembershipsRepository: Repository<UserTenantMembership>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}
  create(createUserTenantMembershipDto: PostUserTenantMembershipDto) {
    return this.userTenantMembershipsRepository.save(
      this.userTenantMembershipsRepository.create(createUserTenantMembershipDto)
    );
  }

  async findOne(id: number) {
    return this.userTenantMembershipsRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateUserTenantMembershipDto: PutUserTenantMembershipDto) {
    const old = await this.findOne(id);
    return this.userTenantMembershipsRepository.save({
      ...old,
      ...updateUserTenantMembershipDto,
    });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id);
    await this.userTenantMembershipsRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
