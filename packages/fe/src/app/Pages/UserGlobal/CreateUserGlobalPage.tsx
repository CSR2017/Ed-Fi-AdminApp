import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { PostUserDto, RoleType } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { userQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { PageTemplate } from '../PageTemplate';
import { SelectRole } from '../../helpers/FormPickers';

const resolver = classValidatorResolver(PostUserDto);

export const CreateUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const goToView = (id: string | number) => navigate(`/users/${id}`);
  const parentPath = useNavToParent();
  const putUser = userQueries.usePost({
    callback: (result) => goToView(result.id),
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isLoading },
  } = useForm<PostUserDto>({ resolver, defaultValues: {} });

  return (
    <PageTemplate constrainWidth title={'Create new user'} actions={undefined}>
      <Box w="20em">
        <form
          onSubmit={handleSubmit((data) =>
            putUser.mutate(data, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['me', 'users'] });
              },
            })
          )}
        >
          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input {...register('username')} placeholder="username" />
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.givenName}>
            <FormLabel>Given name</FormLabel>
            <Input {...register('givenName')} placeholder="givenName" />
            <FormErrorMessage>{errors.givenName?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.familyName}>
            <FormLabel>Family name</FormLabel>
            <Input {...register('familyName')} placeholder="familyName" />
            <FormErrorMessage>{errors.familyName?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.isActive}>
            <FormLabel>Status</FormLabel>
            <Checkbox {...register('isActive')}>Is active</Checkbox>
            <FormErrorMessage>{errors.isActive?.message}</FormErrorMessage>
          </FormControl>
          <FormControl w="20em" isInvalid={!!errors.roleId}>
            <FormLabel>Role</FormLabel>
            <SelectRole
              types={[RoleType.UserGlobal]}
              tenantId={undefined}
              name={'roleId'}
              control={control}
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
              onClick={() => navigate(parentPath)}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </form>
      </Box>
    </PageTemplate>
  );
};
