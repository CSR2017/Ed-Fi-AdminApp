import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { GetOwnershipDto, PutOwnershipDto } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useNavigate, useParams } from '@tanstack/router';
import { useForm } from 'react-hook-form';
import { ownershipQueries } from '../../api';
import { ownershipGlobalIndexRoute, ownershipGlobalRoute } from '../../routes';

const resolver = classValidatorResolver(PutOwnershipDto);

export const EditOwnershipGlobal = (props: { ownership: GetOwnershipDto }) => {
  const { ownership } = props;

  const navigate = useNavigate();
  const goToView = () => {
    navigate({
      to: ownershipGlobalRoute.fullPath,
      params: (old: any) => old,
      search: {},
    });
  };
  const params = useParams({ from: ownershipGlobalIndexRoute.id });
  const putOwnership = ownershipQueries.usePut({
    callback: goToView,
  });
  const ownershipFormDefaults = new PutOwnershipDto();
  ownershipFormDefaults.id = ownership?.id;
  ownershipFormDefaults.roleId = ownership?.roleId;
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm({
    resolver,
    defaultValues: ownershipFormDefaults,
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        putOwnership.mutate({
          id: data.id,
          roleId: data.roleId,
        })
      )}
    >
      <FormControl isInvalid={!!errors.roleId}>
        <FormLabel>Role</FormLabel>
        <Input {...register('roleId')} placeholder="Role" />
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
          type="submit"
          onClick={goToView}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  );
};
