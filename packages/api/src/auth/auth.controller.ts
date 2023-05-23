import {
  Controller,
  Get,
  Post,
  Redirect,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import {
  GetSessionDataDto,
  PrivilegeCode,
  toGetSessionDataDto,
  toGetTenantDto,
} from '@edanalytics/models';
import { LocalAuthGuard } from './login/local-auth.guard';
import { OidcAuthGuard } from './login/oidc-auth.guard';
import { Public } from './authorization/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { environment } from '../environments/environment.local';
import { ApplauncherAuthGuard } from './login/applauncher-auth.guard';
import { ReqUser } from './helpers/user.decorator';
import { Authorize } from './authorization';
import { subject } from '@casl/ability';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '@edanalytics/models-server';
import { Repository } from 'typeorm';
import { UserPrivileges } from './helpers/inject-user-privileges';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>
  ) {}
  @Public()
  @Get('/applauncher/login')
  @Redirect(environment.APPLAUNCHER_LOGIN_URL)
  applauncherLogin() {
    // let redirect decorator handle it
  }

  @UseGuards(ApplauncherAuthGuard)
  @Public()
  @Get('/applauncher/callback/:authResult')
  applauncherLoginCallback(@Res() res: Response, @Request() req) {
    res.redirect(`${environment.FE_URL}${req.query?.state || ''}`); // currently applauncher doesn't support redirect `state` but maybe it will eventually.
  }

  @UseGuards(OidcAuthGuard)
  @Public()
  @Get('/oidc/login')
  oidcLogin() {
    // let passport trigger redirect
  }

  @UseGuards(OidcAuthGuard)
  @Public()
  @Get('/oidc/callback')
  oidcLoginCallback(@Res() res: Response, @Request() req) {
    res.redirect(`${environment.FE_URL}${req.query?.state || ''}`);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('/local/login')
  async login(@Request() req) {
    return toGetSessionDataDto(req.user);
  }

  @Get('me')
  @Authorize({
    privilege: 'me:read',
    subject: {
      id: '__filtered__',
    },
  })
  async me(@ReqUser() session: GetSessionDataDto) {
    return toGetSessionDataDto(session);
  }

  @Get('my-tenants')
  @Authorize({
    privilege: 'me:read',
    subject: {
      id: '__filtered__',
    },
  })
  async myTenants(
    @ReqUser() session: GetSessionDataDto,
    @UserPrivileges() privileges: Set<PrivilegeCode>
  ) {
    if (privileges.has('tenant:read')) {
      return toGetTenantDto(await this.tenantsRepository.find());
    } else {
      return toGetTenantDto(
        session?.userTenantMemberships?.map((utm) => utm.tenant) ?? []
      );
    }
  }

  @Post('/logout')
  @Public()
  async logout(@Request() req /* @Res() res: Response */) {
    return req.session.destroy(async () => {
      return undefined;
      // res.redirect(`${environment.FE_URL}/public`);
    });
  }
}
