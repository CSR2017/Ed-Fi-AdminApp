import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';
import { PostOwnershipDto, RoleType } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from '@tanstack/router';
import { ReactNode, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ownershipQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { ownershipGlobalIndexRoute, ownershipGlobalRoute } from '../../routes';
import { PageTemplate } from '../PageTemplate';
import { isNumber, isNumberString } from 'class-validator';
import {
  SbePickerOptions,
  OdsPickerOptions,
  EdorgPickerOptions,
  TenantPickerOptions,
  RolePickerOptions,
} from '../../helpers/FormPickerOptions';

const resolver = classValidatorResolver(PostOwnershipDto);

export const CreateOwnershipGlobalPage = (): ReactNode => {
  const navigate = useNavigate();
  const navToParentOptions = useNavToParent();
  const goToView = (id: string | number) => {
    navigate({
      to: ownershipGlobalRoute.fullPath,
      params: (old: any) => ({ ...old, ownershipId: String(id) }),
      search: {},
    });
  };
  const params = useParams({ from: ownershipGlobalIndexRoute.id });
  const ownershipFormDefaults = new PostOwnershipDto();
  const postOwnership = ownershipQueries.usePost({
    callback: (result) => {
      goToView(result.id);
    },
  });
  const {
    register,
    handleSubmit,
    formState,
    formState: { errors, isLoading },
    control,
    setValue,
    getValues,
  } = useForm({
    resolver,
    defaultValues: ownershipFormDefaults,
  });
  const [sbe, setSbe] = useState<undefined | number>(undefined);
  const [type, setType] = useState<null | 'ods' | 'sbe' | 'edorg'>(null);

  return (
    <PageTemplate
      constrainWidth
      title={'Grant new resource ownership'}
      actions={undefined}
    >
      <FormLabel>Resource type</FormLabel>
      <Select
        placeholder="Select a resource type"
        value={type === null ? undefined : type}
        onChange={(event) => {
          if (['ods', 'sbe', 'edorg'].includes(event.target.value)) {
            setType(event.target.value as unknown as any);
            setValue('edorgId', undefined);
            setValue('odsId', undefined);
            if (event.target.value === 'sbe' && sbe !== null) {
              setValue('sbeId', sbe);
            } else {
              setValue('sbeId', undefined);
            }
          } else {
            setType(null);
            setValue('edorgId', undefined);
            setValue('odsId', undefined);
            setValue('sbeId', undefined);
          }
        }}
      >
        <option value="sbe">Starting Blocks Environment</option>
        <option value="ods">ODS</option>
        <option value="edorg">Education Organization</option>
      </Select>

      <form
        onSubmit={handleSubmit((data) => {
          if (type !== 'sbe') {
            data.sbeId = undefined;
          }
          postOwnership.mutate(data);
        })}
      >
        <FormControl
          isInvalid={
            !!errors.hasResource && (sbe === undefined || type === 'sbe')
          }
        >
          <FormLabel>Starting Blocks environment</FormLabel>
          <Controller
            control={control}
            name="sbeId"
            render={(props) => (
              <Select
                placeholder="Select an environment"
                {...props.field}
                onChange={(event) => {
                  const value =
                    event.target.value === ''
                      ? undefined
                      : Number(event.target.value);
                  props.field.onChange(value);
                  setSbe(value);
                }}
              >
                <SbePickerOptions />
              </Select>
            )}
          />
          <FormErrorMessage>{errors.hasResource?.message}</FormErrorMessage>
        </FormControl>
        {type === 'ods' ? (
          <FormControl
            isDisabled={sbe === undefined}
            isInvalid={!!errors.hasResource}
          >
            <FormLabel>ODS</FormLabel>
            <Controller
              control={control}
              name="odsId"
              render={(props) => (
                <Select
                  placeholder="Select an ODS"
                  {...props.field}
                  onChange={(event) => {
                    const value =
                      event.target.value === ''
                        ? undefined
                        : Number(event.target.value);
                    props.field.onChange(value);
                  }}
                >
                  {sbe !== undefined ? <OdsPickerOptions sbeId={sbe} /> : null}
                </Select>
              )}
            />
            <FormErrorMessage>{errors.hasResource?.message}</FormErrorMessage>
          </FormControl>
        ) : null}
        {type === 'edorg' ? (
          <FormControl
            isDisabled={sbe === undefined}
            isInvalid={!!errors.hasResource}
          >
            <FormLabel>Ed-Org</FormLabel>
            <Controller
              control={control}
              name="edorgId"
              render={(props) => (
                <Select
                  placeholder="Select an Ed-Org"
                  {...props.field}
                  onChange={(event) => {
                    const value =
                      event.target.value === ''
                        ? undefined
                        : Number(event.target.value);
                    props.field.onChange(value);
                  }}
                >
                  {sbe !== undefined ? (
                    <EdorgPickerOptions sbeId={sbe} />
                  ) : null}
                </Select>
              )}
            />
            <FormErrorMessage>{errors.hasResource?.message}</FormErrorMessage>
          </FormControl>
        ) : null}
        <FormControl isInvalid={!!errors.tenantId}>
          <FormLabel>Tenant</FormLabel>
          <Controller
            control={control}
            name="tenantId"
            render={(props) => (
              <Select
                placeholder="Select a tenant"
                {...props.field}
                onChange={(event) => {
                  const value =
                    event.target.value === ''
                      ? undefined
                      : Number(event.target.value);
                  props.field.onChange(value);
                }}
              >
                <TenantPickerOptions />
              </Select>
            )}
          />
          <FormErrorMessage>{errors.tenantId?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.roleId}>
          <FormLabel>Role</FormLabel>
          <Controller
            control={control}
            name="roleId"
            render={(props) => (
              <Select
                placeholder="Select a role"
                {...props.field}
                onChange={(event) => {
                  const value =
                    event.target.value === ''
                      ? undefined
                      : Number(event.target.value);
                  props.field.onChange(value);
                }}
              >
                <RolePickerOptions types={[RoleType.ResourceOwnership]} />
              </Select>
            )}
          />
          <FormErrorMessage>{errors.roleId?.message}</FormErrorMessage>
        </FormControl>
        <ButtonGroup>
          <Button mt={4} colorScheme="teal" isLoading={isLoading} type="submit">
            Save
          </Button>
          <Button
            mt={4}
            colorScheme="teal"
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
  );
};
