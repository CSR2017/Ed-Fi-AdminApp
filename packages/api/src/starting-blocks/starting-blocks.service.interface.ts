import { GetApplicationDto, GetClaimsetDto, GetVendorDto, PostApplicationDto, PostApplicationResponseDto, PostClaimsetDto, PostVendorDto, PutApplicationDto, PutClaimsetDto, PutVendorDto, SbMetaEnv, Sbe } from "@edanalytics/models"

export interface IStartingBlocksService {
  getVendors(sbeId: Sbe['id']): Promise<GetVendorDto[]>
  getVendor(sbeId: Sbe['id'], vendorId: number): Promise<GetVendorDto>
  putVendor(sbeId: Sbe['id'], vendorId: number, vendor: PutVendorDto): Promise<GetVendorDto>
  postVendor(sbeId: Sbe['id'], vendor: PostVendorDto): Promise<GetVendorDto>
  deleteVendor(sbeId: Sbe['id'], vendorId: number): Promise<void>
  getVendorApplications(sbeId: Sbe['id'], vendorId: number): Promise<GetApplicationDto[]>

  getApplications(sbeId: Sbe['id']): Promise<GetApplicationDto[]>
  getApplication(sbeId: Sbe['id'], applicationId: number): Promise<GetApplicationDto>
  putApplication(sbeId: Sbe['id'], applicationId: number, application: PutApplicationDto): Promise<GetApplicationDto>
  postApplication(sbeId: Sbe['id'], application: PostApplicationDto): Promise<PostApplicationResponseDto>
  deleteApplication(sbeId: Sbe['id'], applicationId: number): Promise<void>
  resetApplicationCredentials(sbeId: Sbe['id'], applicationId: number): Promise<PostApplicationResponseDto>

  getClaimsets(sbeId: Sbe['id']): Promise<GetClaimsetDto[]>
  getClaimset(sbeId: Sbe['id'], claimsetId: number): Promise<GetClaimsetDto>
  putClaimset(sbeId: Sbe['id'], claimsetId: number, claimset: PutClaimsetDto): Promise<GetClaimsetDto>
  postClaimset(sbeId: Sbe['id'], claimset: PostClaimsetDto): Promise<GetClaimsetDto>
  deleteClaimset(sbeId: Sbe['id'], claimsetId: number): Promise<void>

  getSbMeta(sbeId: Sbe['id']): Promise<SbMetaEnv>
}