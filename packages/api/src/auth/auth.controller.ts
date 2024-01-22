import {
  AuthorizationCache,
  GetSessionDataDto,
  Ids,
  PrivilegeCode,
  isBaseTenantPrivilege,
  isGlobalPrivilege,
  isTenantSbePrivilege,
  toGetSessionDataDto,
  toGetTenantDto,
} from '@edanalytics/models';
import { Tenant } from '@edanalytics/models-server';
import {
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Logger,
  Next,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Request,
  Res,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import config from 'config';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import passport from 'passport';
import { Repository } from 'typeorm';
import { Authorize, NoAuthorization } from './authorization';
import { Public } from './authorization/public.decorator';
import { AuthCache } from './helpers/inject-auth-cache';
import { ReqUser } from './helpers/user.decorator';
import { NO_ROLE, USER_NOT_FOUND } from './login/oidc.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>
  ) {}

  @Public()
  @Get('/login/:oidcId')
  oidcLogin(@Param('oidcId') oidcId: number, @Res() res: Response, @Request() req, @Next() next) {
    passport.authenticate(`oidc-${oidcId}`, {
      state: JSON.stringify({
        redirect: req.query?.redirect ?? '/',
        random: randomUUID(),
      }),
    })(req, res, (err) => {
      if (err?.message.includes('Unknown authentication strategy')) {
        throw new NotFoundException();
      } else {
        throw new InternalServerErrorException();
      }
    });
  }

  @Public()
  @Get('/callback/:oidcId')
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
      failureRedirect: `${config.FE_URL}/unauthenticated`,
    })(req, res, (err: Error) => {
      Logger.error(err);

      if (err.message === USER_NOT_FOUND) {
        res.redirect(
          `${config.FE_URL}/unauthenticated?msg=Oops, it looks like your user hasn't been created yet. We'll let you know when you can log in.`
        );
      } else if (err.message === NO_ROLE) {
        res.redirect(
          `${config.FE_URL}/unauthenticated?msg=Your login worked, but it looks like your setup isn't quite complete. We'll let you know when everything's ready.`
        );
      } else if (
        err.message?.startsWith('did not find expected authorization request details in session')
      ) {
        res.redirect(
          `${config.FE_URL}/unauthenticated?msg=Login failed. There may be an issue, but please try again.`
        );
      } else if (err.message?.startsWith('invalid_grant (Code not valid)')) {
        res.redirect(
          `${config.FE_URL}/unauthenticated?msg=It looks like there was a hiccup during login. Please try again.`
        );
      } else {
        res.redirect(
          `${config.FE_URL}/unauthenticated?msg=It looks like your login was not successful. Please try again and contact us if the issue persists.`
        );
      }
    });
  }

  @Get('me')
  @NoAuthorization()
  @Header('Cache-Control', 'no-store')
  async me(@ReqUser() session: GetSessionDataDto, @Req() req) {
    return toGetSessionDataDto(session);
  }
  @Get('my-tenants')
  @NoAuthorization()
  @Header('Cache-Control', 'no-store')
  async myTenants(
    @ReqUser() session: GetSessionDataDto,
    @AuthCache() privileges: AuthorizationCache,
    @Req() req
  ) {
    if (privileges['tenant:read'] === true) {
      return toGetTenantDto(await this.tenantsRepository.find());
    } else {
      return toGetTenantDto(session?.userTenantMemberships?.map((utm) => utm.tenant) ?? []);
    }
  }
  @Get('cache/:tenantId?/:sbeId?/')
  @Authorize({
    privilege: 'me:read',
    subject: {
      id: '__filtered__',
    },
  })
  async privilegeCache(
    @Param('tenantId') tenantId: string | undefined,
    @Param('sbeId') sbeId: string | undefined,
    @AuthCache() cache: AuthorizationCache
  ) {
    const result: Partial<AuthorizationCache> = {};
    if (tenantId === undefined) {
      Object.keys(cache).forEach((privilege: PrivilegeCode) => {
        if (isGlobalPrivilege(privilege)) {
          result[privilege] = cache[privilege];
        }
      });
    }
    if (tenantId !== undefined && sbeId === undefined) {
      Object.keys(cache).forEach((privilege: PrivilegeCode) => {
        if (isBaseTenantPrivilege(privilege)) {
          result[privilege] = cache[privilege] as any;
        }
      });
    }
    if (tenantId !== undefined && sbeId !== undefined) {
      Object.keys(cache).forEach((privilege: PrivilegeCode) => {
        if (isTenantSbePrivilege(privilege) && sbeId in cache[privilege]) {
          result[privilege] = cache[privilege][sbeId];
        }
      });
    }
    return result;
  }

  @Post('/logout')
  @Public()
  async logout(@Request() req /* @Res() res: Response */) {
    return req.session.destroy(async () => {
      return undefined;
    });
  }
}
