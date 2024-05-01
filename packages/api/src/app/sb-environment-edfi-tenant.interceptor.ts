import { EdfiTenant, SbEnvironment } from '@edanalytics/models-server';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  createParamDecorator,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { Repository } from 'typeorm';
import { throwNotFound } from '../utils';

/** Look up SbEnvironment and EdfiTenant identified in route path and attach it to request object */
@Injectable()
export class SbEnvironmentEdfiTenantInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(EdfiTenant)
    private edfiTenantsRepository: Repository<EdfiTenant>,
    @InjectRepository(SbEnvironment)
    private sbEnvironmentsRepository: Repository<SbEnvironment>
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const sbEnvironmentId = Number(request.params?.sbEnvironmentId);
    const edfiTenantId = Number(request.params?.edfiTenantId);

    if (_.isFinite(edfiTenantId)) {
      const edfiTenant = await this.edfiTenantsRepository
        .findOneOrFail({
          where: {
            id: edfiTenantId,
            ...(_.isFinite(sbEnvironmentId) ? { sbEnvironmentId } : {}),
          },
          relations: ['sbEnvironment'],
        })
        .catch(throwNotFound);

      request.edfiTenant = edfiTenant;
      request.sbEnvironment = edfiTenant.sbEnvironment;
    } else if (_.isFinite(sbEnvironmentId)) {
      request.sbEnvironment = await this.sbEnvironmentsRepository
        .findOneByOrFail({ id: sbEnvironmentId })
        .catch(throwNotFound);
    }

    return next.handle();
  }
}

/** Inject EdfiTenant from request object into a handler param */
export const ReqEdfiTenant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!(request?.edfiTenant?.constructor?.name === 'EdfiTenant')) {
    throw new Error("No EdfiTenant found in request's context in ReqEdfiTenant.");
  }
  return request.edfiTenant;
});
/** Inject SbEnvironment from request object into a handler param */
export const ReqSbEnvironment = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (!(request?.sbEnvironment?.constructor?.name === 'SbEnvironment')) {
    throw new Error("No SbEnvironment found in request's context in ReqSbEnvironment.");
  }
  return request.sbEnvironment;
});
