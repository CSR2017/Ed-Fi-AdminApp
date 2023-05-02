import {
  PostApplicationDto,
  PostClaimsetDto,
  PostVendorDto,
  PutApplicationDto,
  PutClaimsetDto,
  PutVendorDto,
  Sbe
} from '@edanalytics/models';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IStartingBlocksService } from './starting-blocks.service.interface';

@ApiTags('Ed-Fi Resources')
@Controller()
export class StartingBlocksController {
  constructor(private readonly sbService: IStartingBlocksService) { }


  @Get('vendors')
  getVendors(
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return this.sbService.getVendors(sbeId)
  }

  @Get('vendors/:vendorId')
  getVendor(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('vendorId', new ParseIntPipe()) vendorId: number) {
    return this.sbService.getVendor(sbeId, vendorId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Put('vendors/:vendorId')
  putVendor(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('vendorId', new ParseIntPipe()) vendorId: number,
    @Body() vendor: PutVendorDto
  ) {
    return this.sbService.putVendor(sbeId, vendorId, vendor).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Post('vendors')
  postVendor(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Body() vendor: PostVendorDto
  ) {
    return this.sbService.postVendor(sbeId, vendor)
  }

  @Delete('vendors/:vendorId')
  deleteVendor(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('vendorId', new ParseIntPipe()) vendorId: number) {
    return this.sbService.deleteVendor(sbeId, vendorId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Get('vendors/:vendorId/applications')
  getVendorApplications(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('vendorId', new ParseIntPipe()) vendorId: number) {
    return this.sbService.getVendorApplications(sbeId, vendorId)
  }

  @Get('applications')
  getApplications(
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return this.sbService.getApplications(sbeId)
  }

  @Get('applications/:applicationId')
  getApplication(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('applicationId', new ParseIntPipe()) applicationId: number) {
    return this.sbService.getApplication(sbeId, applicationId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Put('applications/:applicationId')
  putApplication(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('applicationId', new ParseIntPipe()) applicationId: number,
    @Body() application: PutApplicationDto
  ) {
    return this.sbService.putApplication(sbeId, applicationId, application).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Post('applications')
  postApplication(
    @Param('sbeId', new ParseIntPipe()) sbeId: number, application: PostApplicationDto) {
    return this.sbService.postApplication(sbeId, application)
  }

  @Delete('applications/:applicationId')
  deleteApplication(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('applicationId', new ParseIntPipe()) applicationId: number) {
    return this.sbService.deleteApplication(sbeId, applicationId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Put('applications/:applicationId/reset-credential')
  resetApplicationCredentials(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('applicationId', new ParseIntPipe()) applicationId: number) {
    return this.sbService.resetApplicationCredentials(sbeId, applicationId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Get('claimsets')
  getClaimsets(
    @Param('sbeId', new ParseIntPipe()) sbeId: number
  ) {
    return this.sbService.getClaimsets(sbeId)
  }

  @Get('claimsets/:claimsetId')
  getClaimset(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('claimsetId', new ParseIntPipe()) claimsetId: number) {
    return this.sbService.getClaimset(sbeId, claimsetId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Put('claimsets/:claimsetId')
  putClaimset(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('claimsetId', new ParseIntPipe()) claimsetId: number,
    @Body() claimset: PutClaimsetDto
  ) {
    return this.sbService.putClaimset(sbeId, claimsetId, claimset).catch((err) => {
      throw new NotFoundException();
    }
    )
  }

  @Post('claimsets')
  postClaimset(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Body() claimset: PostClaimsetDto
  ) {
    return this.sbService.postClaimset(sbeId, claimset)
  }

  @Delete('claimsets/:claimsetId')
  deleteClaimset(
    @Param('sbeId', new ParseIntPipe()) sbeId: number,
    @Param('claimsetId', new ParseIntPipe()) claimsetId: number) {
    return this.sbService.deleteClaimset(sbeId, claimsetId).catch((err) => {
      throw new NotFoundException();
    }
    )
  }
}
