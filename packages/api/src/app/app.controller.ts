import {
  Controller,
  Get,
  ImATeapotException,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/authorization/public.decorator';
import { ErrorResponse } from '../utils/DefaultRouteError';
import axios from 'axios';
import config from 'config';

@ApiTags('App')
@Controller()
export class AppController {
  @Public()
  @Get('healthcheck')
  @ErrorResponse(new ImATeapotException('ts'))
  healthcheck() {
    return "Feelin' great!";
  }
  @Public()
  @Get('secret/:secretId')
  @ErrorResponse(new NotFoundException())
  secret(@Param('secretId') secretId: string) {
    return axios
      .get(`${config.YOPASS_URL}/secret/${secretId}`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        Logger.warn(err);
        throw new NotFoundException('Secret not found.');
      });
  }
}
