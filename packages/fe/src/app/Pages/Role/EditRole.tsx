import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { GetRoleDto, PutRoleDto } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { roleQueries } from '../../api';

const resolver = classValidatorResolver(PutRoleDto);

export const EditRole = (props: { role: GetRoleDto }) => {
  const navigate = useNavigate();
  const params = useParams() as {
    asId: string;
    roleId: string;
  };
  const goToView = () => navigate(`/as/${params.asId}/roles/${params.roleId}`);
  const putRole = roleQueries.usePut({
    callback: goToView,
    tenantId: params.asId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PutRoleDto>({
    resolver,
    defaultValues: { ...props.role, privileges: props.role.privileges.map((p) => p.code) },
  });

  return (
    <form onSubmit={handleSubmit((data) => putRole.mutateAsync(data))}>
      <FormControl isInvalid={!!errors.id}>
        <FormLabel>Id</FormLabel>
        <Input {...register('id')} placeholder="id" />
        <FormErrorMessage>{errors.id?.message}</FormErrorMessage>
      </FormControl>
      <ButtonGroup>
        <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
          Save
        </Button>
        <Button
          mt={4}
          colorScheme="teal"
          variant="ghost"
          isLoading={isSubmitting}
          type="reset"
          onClick={goToView}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  );
};
