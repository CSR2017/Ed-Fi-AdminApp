import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { PostOwnershipDto, RoleType } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { plainToInstance } from 'class-transformer';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ownershipQueries, sbeQueries, tenantQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import {
  SelectEdorg,
  SelectOds,
  SelectRole,
  SelectSbe,
  SelectTenant,
} from '../../helpers/FormPickers';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';
import { useSearchParamsObject } from '../../helpers/useSearch';
import { PageTemplate } from '../PageTemplate';

const resolver = classValidatorResolver(PostOwnershipDto);

export const CreateOwnershipGlobalPage = () => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();
  const goToView = (id: string | number) => navigate(`/ownerships/${id}`);
  const search = useSearchParamsObject() as {
    sbeId?: string;
    tenantId?: string;
    type?: 'ods' | 'edorg' | 'sbe';
  };

  const tenants = tenantQueries.useAll({});
  const sbes = sbeQueries.useAll({});

  const ownershipFormDefaults = useMemo(() => {
    const dto = new PostOwnershipDto();

    dto.sbeId =
      search.sbeId !== undefined && search.sbeId in (sbes.data ?? {})
        ? Number(search.sbeId)
        : undefined;

    dto.tenantId =
      search.tenantId !== undefined && search.tenantId in (tenants.data ?? {})
        ? Number(search.tenantId)
        : undefined;

    dto.type = search.type ?? 'ods';

    return dto;
  }, [
    search.tenantId !== undefined && search.tenantId in (tenants.data ?? {}),
    search.sbeId !== undefined && search.sbeId in (sbes.data ?? {}),
  ]);

  const postOwnership = ownershipQueries.usePost({
    callback: (result) => {
      goToView(result.id);
    },
  });
  const {
    handleSubmit,
    formState: { errors, isLoading },
    control,
    setValue,
    watch,
    reset,
    setError,
  } = useForm({
    resolver,
    defaultValues: ownershipFormDefaults,
  });

  useEffect(() => {
    reset((values) => _.defaults(values, { tenantId: ownershipFormDefaults.tenantId }));
  }, [ownershipFormDefaults.tenantId]);

  useEffect(() => {
    reset((values) => _.defaults(values, { sbeId: ownershipFormDefaults.sbeId }));
  }, [ownershipFormDefaults.sbeId]);

  const [sbeId, type] = watch(['sbeId', 'type']);

  return tenants.data && sbes.data ? (
    <PageTemplate constrainWidth title={'Grant new resource ownership'} actions={undefined}>
      <FormLabel>Resource type</FormLabel>
      <RadioGroup
        onChange={(value: any) => {
          setValue('type', value);
          setValue('edorgId', undefined);
          setValue('odsId', undefined);
        }}
        value={type}
      >
        <Stack direction="column" pl="1em" spacing={1}>
          <Radio value="edorg">Ed-Org</Radio>
          <Radio value="ods">Ods</Radio>
          <Radio value="sbe">Whole environment</Radio>
        </Stack>
      </RadioGroup>
      <form
        onSubmit={handleSubmit((data) => {
          const body = plainToInstance(PostOwnershipDto, data);
          if (type !== 'sbe') {
            body.sbeId = undefined;
          }
          postOwnership.mutate(body, mutationErrCallback(setError));
        })}
      >
        <FormControl isInvalid={!!errors.hasResource && (sbeId === undefined || type === 'sbe')}>
          <FormLabel>Starting Blocks environment</FormLabel>
          <SelectSbe name="sbeId" control={control} tenantId={undefined} />
          <FormErrorMessage>{errors.hasResource?.message}</FormErrorMessage>
        </FormControl>
        {type === 'ods' && sbeId !== undefined ? (
          <FormControl isDisabled={sbeId === undefined} isInvalid={!!errors.hasResource}>
            <FormLabel>ODS</FormLabel>
            <SelectOds
              sbeId={sbeId}
              control={control}
              name="odsId"
              useDbName={false}
              tenantId={undefined}
            />
            <FormErrorMessage>{errors.hasResource?.message}</FormErrorMessage>
          </FormControl>
        ) : null}
        {type === 'edorg' && sbeId !== undefined ? (
          <FormControl isDisabled={sbeId === undefined} isInvalid={!!errors.hasResource}>
            <FormLabel>Ed-Org</FormLabel>
            <SelectEdorg
              sbeId={sbeId}
              control={control}
              name="edorgId"
              useEdorgId={false}
              tenantId={undefined}
            />
            <FormErrorMessage>{errors.hasResource?.message}</FormErrorMessage>
          </FormControl>
        ) : null}
        <FormControl isInvalid={!!errors.tenantId}>
          <FormLabel>Tenant</FormLabel>
          <SelectTenant name="tenantId" control={control} />
          <FormErrorMessage>{errors.tenantId?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.roleId}>
          <FormLabel>Role</FormLabel>
          <SelectRole
            name="roleId"
            types={[RoleType.ResourceOwnership]}
            control={control}
            tenantId={undefined}
          />
          <FormErrorMessage>{errors.roleId?.message}</FormErrorMessage>
        </FormControl>
        <ButtonGroup mt={4} colorScheme="teal">
          <Button isLoading={isLoading} type="submit">
            Save
          </Button>
          <Button
            variant="ghost"
            isLoading={isLoading}
            type="reset"
            onClick={() => {
              navigate(navToParentOptions);
            }}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </PageTemplate>
  ) : null;
};
