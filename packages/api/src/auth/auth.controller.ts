import {
  Controller,
  Get,
  Header,
  Next,
  Param,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AuthorizationCache,
  GetSessionDataDto,
  Ids,
  PrivilegeCode,
  isGlobalPrivilege,
  isSbePrivilege,
  toGetSessionDataDto,
  toGetTenantDto,
} from '@edanalytics/models';
import { Tenant } from '@edanalytics/models-server';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import config from 'config';
import passport from 'passport';
import { Repository } from 'typeorm';
import { Authorize } from './authorization';
import { Public } from './authorization/public.decorator';
import { AuthCache } from './helpers/inject-auth-cache';
import { UserPrivileges } from './helpers/inject-user-privileges';
import { ReqUser } from './helpers/user.decorator';
import { IdpService } from './idp.service';
import { LocalAuthGuard } from './login/local-auth.guard';
import { randomUUID } from 'crypto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
    private readonly idpService: IdpService
  ) {}

  @Public()
  @Get('/applauncher/:appLauncherId/login')
  async applauncherLogin(
    @Param('appLauncherId') appLauncherId: number,
    @Res() res: Response
  ) {
    const alConfig = await this.idpService.getAppLauncherConnection(
      appLauncherId
    );
    res.redirect(alConfig.url);
  }

  @Public()
  @Get('/applauncher/:appLauncherId/callback/:authResult')
  applauncherLoginCallback(
    @Param('appLauncherId') appLauncherId: number,
    @Res() res: Response,
    @Request() req,
    @Next() next
  ) {
    passport.authenticate(`al-${appLauncherId}`, {
      successRedirect: `${config.FE_URL}`,
      failWithError: true,
    })(req, res, next);
  }

  @Public()
  @Get('/oidc/:oidcId/login')
  oidcLogin(
    @Param('oidcId') oidcId: number,
    @Res() res: Response,
    @Request() req,
    @Next() next
  ) {
    passport.authenticate(`oidc-${oidcId}`, {
      state: JSON.stringify({
        redirect: req.query?.redirect ?? '/',
        random: randomUUID(),
      }),
    })(req, res, next);
  }

  @Public()
  @Get('/oidc/:oidcId/callback')
  oidcLoginCallback(
    @Param('oidcId') oidcId: number,
    @Res() res: Response,
    @Request() req,
    @Next() next
  ) {
    let redirect = '/';
    try {
      redirect = JSON.parse(req.query.state).redirect;
    } catch (error) {
      // no redirect
    }
    passport.authenticate(`oidc-${oidcId}`, {
      successRedirect: `${config.FE_URL}${redirect}`,
      failWithError: true,
    })(req, res, next);
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
  @Header('Cache-Control', 'none')
  async me(@ReqUser() session: GetSessionDataDto) {
    return toGetSessionDataDto(session);
  }
  @Get('authorizations/:privilege/:tenantId?')
  @Authorize({
    privilege: 'me:read',
    subject: {
      id: '__filtered__',
    },
  })
  async privilegeCache(
    @Param('privilege') privilege: PrivilegeCode,
    @Param('tenantId') tenantId: string | undefined,
    @Query('sbeId') sbeId: string | undefined,
    @AuthCache() cache: AuthorizationCache
  ) {
    let result: Ids | false | undefined = false;
    if (tenantId === undefined && isGlobalPrivilege(privilege)) {
      result = cache?.[privilege];
    } else if (tenantId !== undefined && !isGlobalPrivilege(privilege)) {
      if (sbeId === undefined && !isSbePrivilege(privilege)) {
        result = cache?.[privilege];
      } else if (sbeId !== undefined && isSbePrivilege(privilege)) {
        result = cache?.[privilege]?.[sbeId];
      }
    }
    return result === true
      ? true
      : result === false || result === undefined
      ? false
      : [...result];
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
    });
  }
}
