import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { PutSbeDto } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from '@tanstack/router';
import { useForm } from 'react-hook-form';
import { sbeQueries } from '../../api';
import { sbeGlobalIndexRoute, sbeGlobalRoute } from '../../routes';
import _ from 'lodash';

interface PutSbeFormFields {
  adminApiUrl?: string;
  adminApiKey?: string;
  adminApiSecret?: string;
  sbeMetaUrl?: string;
  sbeMetaKey?: string;
  sbeMetaSecret?: string;
  envLabel?: string;
}

const resolver = classValidatorResolver(PutSbeDto);

export const EditSbeGlobal = () => {
  const navigate = useNavigate();
  const goToView = () => {
    navigate({
      to: sbeGlobalRoute.fullPath,
      params: (old: any) => old,
      search: {},
    });
  };
  const params = useParams({ from: sbeGlobalIndexRoute.id });
  const putSbe = sbeQueries.usePut({
    callback: goToView,
  });
  const sbe = sbeQueries.useOne({
    id: params.sbeId,
  }).data;
  const sbeFormDefaults: PutSbeFormFields = {
    envLabel: sbe?.envLabel,
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<PutSbeFormFields>({ resolver, defaultValues: sbeFormDefaults });

  return sbe ? (
    <form
      onSubmit={handleSubmit((data) =>
        putSbe.mutate({
          id: Number(params.sbeId),
          envLabel: data.envLabel!,
          configPrivate: _.omit(data, 'envLabel') as any,
        })
      )}
    >
      {/* TODO: replace this with real content */}
      <FormControl isInvalid={!!errors.envLabel}>
        <FormLabel>Environment label</FormLabel>
        <Input {...register('envLabel')} placeholder="envLabel" />
        <FormErrorMessage>{errors.envLabel?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.adminApiUrl}>
        <FormLabel>adminApiUrl</FormLabel>
        <Input {...register('adminApiUrl')} placeholder="adminApiUrl" />
        <FormErrorMessage>{errors.adminApiUrl?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.adminApiKey}>
        <FormLabel>adminApiKey</FormLabel>
        <Input {...register('adminApiKey')} placeholder="adminApiKey" />
        <FormErrorMessage>{errors.adminApiKey?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.adminApiSecret}>
        <FormLabel>adminApiSecret</FormLabel>
        <Input {...register('adminApiSecret')} placeholder="adminApiSecret" />
        <FormErrorMessage>{errors.adminApiSecret?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.sbeMetaUrl}>
        <FormLabel>sbeMetaUrl</FormLabel>
        <Input {...register('sbeMetaUrl')} placeholder="sbeMetaUrl" />
        <FormErrorMessage>{errors.sbeMetaUrl?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.sbeMetaKey}>
        <FormLabel>sbeMetaKey</FormLabel>
        <Input {...register('sbeMetaKey')} placeholder="sbeMetaKey" />
        <FormErrorMessage>{errors.sbeMetaKey?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.sbeMetaSecret}>
        <FormLabel>sbeMetaSecret</FormLabel>
        <Input {...register('sbeMetaSecret')} placeholder="sbeMetaSecret" />
        <FormErrorMessage>{errors.sbeMetaSecret?.message}</FormErrorMessage>
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
