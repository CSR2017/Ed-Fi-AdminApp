import { FakeMeUsing, generateFake } from '@edanalytics/utils';
import { faker } from '@faker-js/faker';
import { Expose } from 'class-transformer';
import { makeSerializer } from '../utils/make-serializer';

export class PostVendorDto {
  @Expose()
  company: string;
  @Expose()
  namespacePrefixes: string;
  @Expose()
  contactName: string;
  @Expose()
  contactEmailAddress: string;
}

@FakeMeUsing(() => {
  const companyName = faker.company.name();
  const safeName = companyName.replace(/[^\w]+/g, '-').toLowerCase();
  const contactName = faker.name.fullName();
  return {
    vendorId: faker.datatype.number(999999),
    company: companyName,
    namespacePrefixes: `@${safeName}`,
    contactName: contactName,
    contactEmailAddress: `${contactName
      .replace(/\s+/g, '.')
      .toLowerCase()}@${safeName}.com`,
  };
})
export class GetVendorDto extends PostVendorDto {
  @Expose()
  vendorId: number;

  get id() {
    return this.vendorId;
  }

  get displayName() {
    return this.company;
  }
}
export class PutVendorDto extends GetVendorDto {}
export const toGetVendorDto = makeSerializer(GetVendorDto);

class AuthStrategyDto {
  @Expose()
  authStrategyName: string;
  @Expose()
  isInheritedFromParent: boolean;
}

class ResourceClaimDto {
  @Expose()
  @FakeMeUsing(faker.internet.domainWord)
  name: string;
  @Expose()
  @FakeMeUsing(faker.datatype.boolean)
  read: boolean;
  @Expose()
  @FakeMeUsing(faker.datatype.boolean)
  create: boolean;
  @Expose()
  @FakeMeUsing(faker.datatype.boolean)
  update: boolean;
  @Expose()
  @FakeMeUsing(faker.datatype.boolean)
  delete: boolean;
  @Expose()
  @FakeMeUsing(() => [])
  defaultAuthStrategiesForCRUD: AuthStrategyDto[];
  @Expose()
  @FakeMeUsing(() => [])
  authStrategyOverridesForCRUD: AuthStrategyDto[];
  @Expose()
  @FakeMeUsing(() => [])
  children: ResourceClaimDto[];
}

export class PostClaimsetDto {
  @Expose()
  @FakeMeUsing(
    () =>
      faker.helpers.arrayElement(['sis', 'sis - on-prem', 'assessment']) +
      '-' +
      faker.datatype.number(10)
  )
  name: string;
  @Expose()
  @FakeMeUsing(() =>
    generateFake(ResourceClaimDto, undefined, faker.datatype.number(5))
  )
  resourceClaims: ResourceClaimDto[];
}

export class PutClaimsetDto extends PostClaimsetDto {
  @Expose()
  @FakeMeUsing(() => faker.datatype.number(999999))
  id: number;
}
export class GetClaimsetDto extends PutClaimsetDto {
  @Expose()
  @FakeMeUsing(faker.datatype.boolean)
  isSystemReserved: boolean;
  @Expose()
  @FakeMeUsing(0)
  applicationsCount: number;

  get displayName() {
    return this.name;
  }
}
export const toGetClaimsetDto = makeSerializer(GetClaimsetDto);

export class PostApplicationDto {
  @Expose()
  applicationName: string;
  @Expose()
  vendorId: string;
  @Expose()
  claimSetName: string;
  @Expose()
  profileId: number;
  @Expose()
  educationOrganizationIds: number[];
}

export class PostApplicationResponseDto {
  @Expose()
  applicationId: number;
  @Expose()
  key: string;
  @Expose()
  secret: string;
}

export class PutApplicationDto extends PostApplicationDto {
  @Expose()
  applicationId: number;
}

export class ApplicationResetCredentialResponseDto {
  @Expose()
  applicationId: number;
  @Expose()
  key: string;
  @Expose()
  secret: string;
}

export class GetApplicationDto {
  @Expose()
  @FakeMeUsing(() => faker.datatype.number(999999))
  applicationId: number;
  @Expose()
  @FakeMeUsing(
    () => faker.commerce.department() + ' ' + faker.company.catchPhraseNoun()
  )
  @Expose()
  applicationName: string;
  @Expose()
  claimSetName: string;
  @Expose()
  @FakeMeUsing('default')
  profileName: string;
  @Expose()
  educationOrganizationId: number;
  @Expose()
  odsInstanceName: string;

  get displayName() {
    return this.applicationName;
  }

  get id() {
    return this.applicationId;
  }
}

export const toGetApplicationDto = makeSerializer(GetApplicationDto);
