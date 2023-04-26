import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserDto, PostUserDto, PutUserDto, User } from '@edanalytics/models';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) { }

  create(createUserDto: PostUserDto) {
    return this.usersRepository.save(
      this.usersRepository.create(createUserDto)
    );
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id: id });
  }

  async update(id: number, updateUserDto: PutUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return this.usersRepository.findOneByOrFail({ id });
  }

  async remove(id: number, user: GetUserDto) {
    await this.usersRepository.update(id, {
      deleted: new Date(),
      deletedById: user.id,
    });
    return undefined;
  }
}
