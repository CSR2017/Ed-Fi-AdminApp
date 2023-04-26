import {
  addUserCreating,
  addUserModifying,
  GetSessionDataDto,
  PostUserDto,
  PutUserDto,
  toGetUserDto,
} from '@ts-app-base-se/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ReqUser } from '../auth/user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @Post()
  async create(
    @Body() createUserDto: PostUserDto,
    @ReqUser() session: GetSessionDataDto
  ) {
    return toGetUserDto(
      await this.userService.create(
        addUserCreating(createUserDto, session.user)
      )
    );
  }

  @Get()
  async findAll() {
    return toGetUserDto(await this.userService.findAll());
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return toGetUserDto(await this.userService.findOne(+id));
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateUserDto: PutUserDto,
    @ReqUser() session: GetSessionDataDto
  ) {
    return toGetUserDto(
      await this.userService.update(
        id,
        addUserModifying(updateUserDto, session.user)
      )
    );
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseIntPipe()) id: number,
    @ReqUser() session: GetSessionDataDto
  ) {
    return this.userService.remove(+id, session.user);
  }
}
