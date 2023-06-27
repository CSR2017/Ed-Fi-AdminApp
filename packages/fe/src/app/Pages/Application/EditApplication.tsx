import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import {
  GetApplicationDto,
  PutApplicationDto,
  PutApplicationForm,
} from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from '@tanstack/router';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { useForm } from 'react-hook-form';
import { applicationQueries, claimsetQueries, edorgQueries } from '../../api';
import {
  SelectClaimset,
  SelectEdorg,
  SelectVendor,
} from '../../helpers/FormPickers';
import { applicationIndexRoute, applicationRoute } from '../../routes';

const resolver = classValidatorResolver(PutApplicationForm);

export const EditApplication = (props: { application: GetApplicationDto }) => {
  const { application } = props;
  const navigate = useNavigate();
  const goToView = () => {
    navigate({
      to: applicationRoute.fullPath,
      params: (old: any) => old,
      search: {},
    });
  };
  const params = useParams({ from: applicationIndexRoute.id });
  const edorgs = edorgQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  const claimsets = claimsetQueries.useAll({
    sbeId: params.sbeId,
    tenantId: params.asId,
  });

  const putApplication = applicationQueries.usePut({
    sbeId: params.sbeId,
    tenantId: params.asId,
    callback: goToView,
  });
  const defaultValues = new PutApplicationForm();
  defaultValues.applicationId = application.applicationId;
  defaultValues.applicationName = application.displayName;
  defaultValues.claimSetName = application.claimSetName;
  defaultValues.educationOrganizationId = application.educationOrganizationId;
  defaultValues.vendorId = application.vendorId;

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    formState,
    control,
    watch,
    getValues,
  } = useForm<PutApplicationForm>({
    resolver,
    defaultValues,
  });
  console.log(watch('educationOrganizationId'), getValues());
  return edorgs.data && claimsets.data ? (
    <form
      onSubmit={handleSubmit((data) => {
        putApplication.mutate(data);
      })}
    >
      <Box width="20em">
        <FormControl isInvalid={!!errors.applicationName}>
          <FormLabel>Application name</FormLabel>
          <Input {...register('applicationName')} placeholder="name" />
          <FormErrorMessage>{errors.applicationName?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.educationOrganizationId}>
          <FormLabel>Ed-org</FormLabel>
          <SelectEdorg
            tenantId={params.asId}
            name="educationOrganizationId"
            useEdorgId
            sbeId={params.sbeId}
            control={control}
          />
          <FormErrorMessage>
            {errors.educationOrganizationId?.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.vendorId}>
          <FormLabel>Vendor</FormLabel>
          <SelectVendor
            tenantId={params.asId}
            name="vendorId"
            sbeId={params.sbeId}
            control={control}
          />
          <FormErrorMessage>{errors.vendorId?.message}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.claimSetName}>
          <FormLabel>Claimset</FormLabel>
          <SelectClaimset
            useName
            tenantId={params.asId}
            name="claimSetName"
            sbeId={params.sbeId}
            control={control}
          />
          <FormErrorMessage>{errors.claimSetName?.message}</FormErrorMessage>
        </FormControl>
        <ButtonGroup mt={4} colorScheme="teal">
          <Button isLoading={isLoading} type="submit">
            Save
          </Button>
          <Button
            variant="ghost"
            isLoading={isLoading}
            type="reset"
            onClick={goToView}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Box>
    </form>
  ) : null;
};
