import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { GetSbeDto, PutSbeAdminApi } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate } from '@tanstack/router';
import { useForm } from 'react-hook-form';
import { useSbeEditAdminApi } from '../../api';
import { sbeGlobalRoute } from '../../routes';
import _ from 'lodash';

const resolver = classValidatorResolver(PutSbeAdminApi);

export const EditSbeAdminApi = (props: { sbe: GetSbeDto }) => {
  const navigate = useNavigate();
  const goToView = () => {
    navigate({
      to: sbeGlobalRoute.fullPath,
      params: (old: any) => old,
      search: (old: any) => _.omit(old, 'edit'),
    });
  };
  const putSbe = useSbeEditAdminApi(goToView);
  const { sbe } = props;
  const sbeFormDefaults: PutSbeAdminApi = {
    id: sbe.id,
    adminKey: sbe.configPublic?.adminApiKey,
    adminUrl: sbe.configPublic?.adminApiUrl,
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<PutSbeAdminApi>({ resolver, defaultValues: sbeFormDefaults });

  return sbe ? (
    <form
      onSubmit={handleSubmit((data) =>
        putSbe.mutate({
          ...data,
        })
      )}
    >
      {/* TODO: replace this with real content */}
      <FormControl isInvalid={!!errors.adminUrl}>
        <FormLabel>Admin API URL</FormLabel>
        <Input {...register('adminUrl')} placeholder="URL" />
        <FormErrorMessage>{errors.adminUrl?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.adminKey}>
        <FormLabel>Admin API key</FormLabel>
        <Input {...register('adminKey')} placeholder="key" />
        <FormErrorMessage>{errors.adminKey?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.adminSecret}>
        <FormLabel>Admin API Secret</FormLabel>
        <Input {...register('adminSecret')} placeholder="adminApiKey" />
        <FormErrorMessage>{errors.adminSecret?.message}</FormErrorMessage>
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
          type="submit"
          onClick={goToView}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  ) : null;
};
