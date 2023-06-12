import { RoleType } from '@edanalytics/models';
import {
  claimsetQueries,
  edorgQueries,
  odsQueries,
  roleQueries,
  sbeQueries,
  tenantQueries,
  vendorQueries,
} from '../api';

export const TenantPickerOptions = (props: object) => {
  const tenants = tenantQueries.useAll({});
  return (
    <>
      {Object.values(tenants.data ?? {}).map((tenant) => {
        return (
          <option key={tenant.id} value={tenant.id}>
            {tenant.displayName}
          </option>
        );
      })}
    </>
  );
};
export const OdsPickerOptions = (props: {
  sbeId: number;
  tenantId?: number;
}) => {
  const { sbeId, tenantId } = props;
  const odss = odsQueries.useAll({ sbeId, tenantId });
  return (
    <>
      {Object.values(odss.data ?? {}).map((ods) => {
        return (
          <option key={ods.id} value={ods.id}>
            {ods.displayName}
          </option>
        );
      })}
    </>
  );
};
export const EdorgPickerOptions = (props: {
  sbeId: number | string;
  tenantId?: number | string;
}) => {
  const { sbeId, tenantId } = props;
  const edorgs = edorgQueries.useAll({ sbeId, tenantId });
  return (
    <>
      {Object.values(edorgs.data ?? {}).map((edorg) => {
        return (
          <option key={edorg.id} value={edorg.id}>
            {edorg.displayName}
          </option>
        );
      })}
    </>
  );
};

export const EdorgPickerOptionsEdorgId = (props: {
  sbeId: number | string;
  tenantId?: number | string;
}) => {
  const { sbeId, tenantId } = props;
  const edorgs = edorgQueries.useAll({ sbeId, tenantId });
  return (
    <>
      {Object.values(edorgs.data ?? {}).map((edorg) => {
        return (
          <option key={edorg.id} value={edorg.educationOrganizationId}>
            {edorg.displayName}
          </option>
        );
      })}
    </>
  );
};
export const SbePickerOptions = (props: { tenantId?: number }) => {
  const { tenantId } = props;
  const sbes = sbeQueries.useAll({ tenantId });
  return (
    <>
      {Object.values(sbes.data ?? {}).map((sbe) => {
        return (
          <option key={sbe.id} value={sbe.id}>
            {sbe.displayName}
          </option>
        );
      })}
    </>
  );
};
export const RolePickerOptions = (props: {
  tenantId?: number;
  types: RoleType[];
}) => {
  const { tenantId, types } = props;
  const roles = roleQueries.useAll({ tenantId });
  return (
    <>
      {Object.values(roles.data ?? {})
        .filter((role) => types.includes(role.type))
        .map((role) => {
          return (
            <option key={role.id} value={role.id}>
              {role.displayName}
            </option>
          );
        })}
    </>
  );
};

export const VendorPickerOptions = (props: {
  sbeId: number | string;
  tenantId: number | string;
}) => {
  const { tenantId, sbeId } = props;
  const vendors = vendorQueries.useAll({
    sbeId: sbeId,
    tenantId: tenantId,
  });
  return (
    <>
      {Object.values(vendors.data ?? {}).map((vendor) => {
        return (
          <option key={vendor.id} value={vendor.id}>
            {vendor.displayName}
          </option>
        );
      })}
    </>
  );
};

export const ClaimsetPickerOptions = (props: {
  sbeId: number | string;
  tenantId: number | string;
}) => {
  const { tenantId, sbeId } = props;
  const claimsets = claimsetQueries.useAll({
    sbeId: sbeId,
    tenantId: tenantId,
  });
  return (
    <>
      {Object.values(claimsets.data ?? {}).map((claimset) => {
        return (
          <option key={claimset.name} value={claimset.name}>
            {claimset.displayName}
          </option>
        );
      })}
    </>
  );
};
