import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { GetApplicationDto, PutApplicationForm } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationQueries, claimsetQueries, edorgQueries } from '../../api';
import { SelectClaimset, SelectEdorg, SelectVendor } from '../../helpers/FormPickers';

const resolver = classValidatorResolver(PutApplicationForm);

export const EditApplication = (props: { application: GetApplicationDto }) => {
  const { application } = props;
  const params = useParams() as { asId: string; sbeId: string };
  const navigate = useNavigate();
  const goToView = () => {
    navigate(`/as/${params.asId}/sbes/${params.sbeId}/applications/${application.id}`);
  };
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
          <FormErrorMessage>{errors.educationOrganizationId?.message}</FormErrorMessage>
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
          <Button variant="ghost" isLoading={isLoading} type="reset" onClick={goToView}>
            Cancel
          </Button>
        </ButtonGroup>
      </Box>
    </form>
  ) : null;
};
