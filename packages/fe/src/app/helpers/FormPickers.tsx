import { RoleType } from '@edanalytics/models';
import { Select } from 'chakra-react-select';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import {
  TenantOptions,
  applicationQueries,
  claimsetQueries,
  edorgQueries,
  odsQueries,
  roleQueries,
  sbeQueries,
  tenantQueries,
  userQueries,
  vendorQueries,
} from '../api';

function SelectWrapper<Dto extends Record<Name, number>, Name extends keyof Dto>(props: {
  control: Control<Dto>;
  name: Name;
  options: Record<string, { value: number | string; label: string }>;
  onClick?: (value: any) => void;
}) {
  const optionsArray = Object.values(props.options);
  return (
    <Controller
      control={props.control}
      name={props.name as any}
      render={({ field, field: { value } }) => (
        <Select
          options={optionsArray as any}
          name={field.name}
          onBlur={field.onBlur}
          selectedOptionStyle="check"
          value={
            value === undefined
              ? { label: 'Select an option', value: '' as any }
              : {
                  label: props.options?.[value as any]?.label ?? '...loading',
                  value: value,
                }
          }
          onChange={(value) => {
            field.onChange(value?.value);
          }}
        />
      )}
    />
  );
}

type FormPickerTypeProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  IncludeSbe extends boolean,
  IncludeTenant extends TenantOptions,
  OtherProps extends object = {}
> = {
  control: Control<TFieldValues>;
  name: TName;
  onClick?: (value: any) => void;
} & OtherProps &
  (IncludeTenant extends TenantOptions.Never
    ? {}
    : IncludeTenant extends TenantOptions.Optional
    ? {
        tenantId: string | number | undefined;
      }
    : { tenantId: string | number }) &
  (IncludeSbe extends false ? {} : { sbeId: string | number });

export const SelectRole = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<
    TFieldValues,
    TName,
    false,
    TenantOptions.Optional,
    { types: RoleType[] }
  >
) => {
  const { tenantId, types, ...others } = props;
  const roles = roleQueries.useAll({ tenantId });
  const options = Object.fromEntries(
    Object.values(roles.data ?? {})
      .filter((role) => types.includes(role.type))
      .map((role) => [
        role.id,
        {
          value: role.id,
          label: role.displayName,
        },
      ])
  );
  return <SelectWrapper {...others} options={options} />;
};

export const SelectSbe = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<TFieldValues, TName, false, TenantOptions.Optional>
) => {
  const { tenantId, control, name } = props;
  const sbes = sbeQueries.useAll({ tenantId });
  const options = Object.fromEntries(
    Object.values(sbes.data ?? {}).map((sbe) => [
      sbe.id,
      {
        value: sbe.id,
        label: sbe.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};
export const SelectTenant = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<TFieldValues, TName, false, TenantOptions.Never>
) => {
  const { control, name } = props;
  const tenants = tenantQueries.useAll({});
  const options = Object.fromEntries(
    Object.values(tenants.data ?? {}).map((tenant) => [
      tenant.id,
      {
        value: tenant.id,
        label: tenant.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};
export const SelectUser = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<TFieldValues, TName, false, TenantOptions.Optional>
) => {
  const { control, name, tenantId } = props;
  const users = userQueries.useAll({ tenantId });
  const options = Object.fromEntries(
    Object.values(users.data ?? {}).map((user) => [
      user.id,
      {
        value: user.id,
        label: user.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};

export const SelectClaimset = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<
    TFieldValues,
    TName,
    true,
    TenantOptions.Required,
    { useName?: boolean | undefined }
  >
) => {
  const { control, name, tenantId, sbeId } = props;
  const claimsets = claimsetQueries.useAll({ tenantId, sbeId });
  const options = Object.fromEntries(
    Object.values(claimsets.data ?? {}).map((claimset) => [
      props.useName ? claimset.name : claimset.id,
      {
        value: props.useName ? claimset.name : claimset.id,
        label: claimset.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};

export const SelectVendor = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<TFieldValues, TName, true, TenantOptions.Required>
) => {
  const { control, name, tenantId, sbeId } = props;
  const vendors = vendorQueries.useAll({ tenantId, sbeId });
  const options = Object.fromEntries(
    Object.values(vendors.data ?? {}).map((vendor) => [
      vendor.id,
      {
        value: vendor.id,
        label: vendor.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};

export const SelectApplication = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<TFieldValues, TName, true, TenantOptions.Required>
) => {
  const { control, name, tenantId, sbeId } = props;
  const applications = applicationQueries.useAll({ tenantId, sbeId });
  const options = Object.fromEntries(
    Object.values(applications.data ?? {}).map((application) => [
      application.id,
      {
        value: application.id,
        label: application.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};

export const SelectOds = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<
    TFieldValues,
    TName,
    true,
    TenantOptions.Optional,
    { useDbName?: boolean | undefined }
  >
) => {
  const { control, name, tenantId, sbeId } = props;
  const odss = odsQueries.useAll({ tenantId, sbeId });
  const options = Object.fromEntries(
    Object.values(odss.data ?? {}).map((ods) => [
      props.useDbName ? ods.dbName : ods.id,
      {
        value: props.useDbName ? ods.dbName : ods.id,
        label: ods.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};

export const SelectEdorg = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormPickerTypeProps<
    TFieldValues,
    TName,
    true,
    TenantOptions.Optional,
    { useEdorgId?: boolean | undefined }
  >
) => {
  const { control, name, tenantId, sbeId } = props;
  const odss = edorgQueries.useAll({ tenantId, sbeId });
  const options = Object.fromEntries(
    Object.values(odss.data ?? {}).map((edorg) => [
      props.useEdorgId ? edorg.educationOrganizationId : edorg.id,
      {
        value: props.useEdorgId ? edorg.educationOrganizationId : edorg.id,
        label: edorg.displayName,
      },
    ])
  );
  return <SelectWrapper control={control} name={name} options={options} />;
};
