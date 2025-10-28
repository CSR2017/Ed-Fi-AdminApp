import { Controller, Get, Header, Logger, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import axios from 'axios';
import config from 'config';
import { Public } from '../auth/authorization/public.decorator';
import { Throttle } from '@nestjs/throttler';

class SecretIdDto {
  @IsUUID(4, { message: 'secretId must be a valid UUID' })
  secretId: string;
}

@ApiTags('App')
@Controller()
export class AppController {
  @Public()
  @Get('healthcheck')
  healthcheck() {
    return "Feelin' great!";
  }

  // Override default configuration for Rate limiting and duration.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @Header('Cache-Control', 'no-store')
  @Get('secret/:secretId/')
  secret(@Param() params: SecretIdDto) {
    const yopassUrl = new URL(`/secret/${encodeURIComponent(params.secretId)}`, config.YOPASS_URL);

    return axios
      .get(yopassUrl.toString())
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        Logger.warn(err);
        throw new NotFoundException('Secret not found.');
      });
  }
}
