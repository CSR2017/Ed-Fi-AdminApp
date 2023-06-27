import { AppLauncher, Oidc } from '@edanalytics/models-server';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IdpService {
  constructor(
    @InjectRepository(Oidc)
    private oidcRepo: Repository<Oidc>,
    @InjectRepository(AppLauncher)
    private alRepo: Repository<AppLauncher>
  ) {}
  async getOidcConnection(id: number) {
    return this.oidcRepo.findOneByOrFail({ id }).catch((err) => {
      throw new NotFoundException();
    });
  }
  async getAppLauncherConnection(id: number) {
    return this.alRepo.findOneByOrFail({ id }).catch((err) => {
      throw new NotFoundException();
    });
  }
}
