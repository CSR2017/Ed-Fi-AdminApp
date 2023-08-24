import { GetUserDto, PostRoleDto, PutRoleDto, RoleType } from '@edanalytics/models';
import {
  Ownership,
  Privilege,
  Role,
  User,
  UserTenantMembership,
  regarding,
} from '@edanalytics/models-server';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { EntityManager, In, Repository } from 'typeorm';
import { throwNotFound } from '../utils';
import { WorkflowFailureException } from '../utils/customExceptions';
import { StatusType } from '@edanalytics/utils';

@Injectable()
export class RolesGlobalService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Privilege)
    private privilegesRepository: Repository<Privilege>,
    @InjectRepository(UserTenantMembership)
    private utmRepository: Repository<UserTenantMembership>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Ownership)
    private ownershipsRepository: Repository<Ownership>
  ) {}
  async create(createRoleDto: PostRoleDto) {
    const uniqueReqPrivileges = _.uniq(createRoleDto.privileges);
    const validPrivileges = await this.privilegesRepository.findBy({
      code: In(createRoleDto.privileges),
    });
    if (validPrivileges.length !== uniqueReqPrivileges.length) {
      throw new BadRequestException('Invalid privileges');
    }
    return this.rolesRepository.save({
      tenantId: createRoleDto.tenantId,
      type: createRoleDto.type,
      name: createRoleDto.name,
      description: createRoleDto.description,
      privileges: validPrivileges,
    });
  }

  async findOne(id: number) {
    return this.rolesRepository.findOneByOrFail({ id });
  }

  async update(id: number, updateRoleDto: PutRoleDto) {
    const old = await this.findOne(id);
    const uniqueReqPrivileges = _.uniq(updateRoleDto.privileges);
    const newPrivileges = await this.privilegesRepository.findBy({
      code: In(updateRoleDto.privileges),
    });
    if (newPrivileges.length !== uniqueReqPrivileges.length) {
      throw new BadRequestException('Invalid privileges');
    }
    return this.rolesRepository.save({
      ...old,
      name: updateRoleDto.name,
      description: updateRoleDto.description,
      privileges: newPrivileges,
    });
  }

  async remove(id: number, user: GetUserDto) {
    const old = await this.findOne(id).catch(throwNotFound);
    const memberships = await this.utmRepository.findBy({ roleId: id });
    const users = await this.usersRepository.findBy({ roleId: id });
    const ownerships = await this.ownershipsRepository.findBy({ roleId: id });

    if (memberships.length || ownerships.length || users.length) {
      throw new WorkflowFailureException({
        status: StatusType.error,
        title: 'Oops, it looks like this role is still being used.',
        message: `Make sure it's not applied to any ${
          ownerships.length ? 'memberships' : users.length ? 'users' : 'ownerships'
        } before trying again.`,
        regarding: regarding(old),
      });
    }
    await this.rolesRepository.remove(old);
    return undefined;
  }
}
