import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto, PostUserDto, PutUserDto } from '@edanalytics/models';
import { Repository } from 'typeorm';
import { throwNotFound } from '../../utils';
import { User } from '@edanalytics/models-server';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  findAll(tenantId: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.userTenantMemberships', 'utm')
      .where('utm.tenantId = :tenantId', { tenantId })
      .getMany();
  }

  findOne(tenantId: number, id: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.userTenantMemberships', 'utm')
      .where('utm.tenantId = :tenantId', { tenantId })
      .andWhere('user.id = :id', { id })
      .getOneOrFail()
      .catch(throwNotFound);
  }
}
