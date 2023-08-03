import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { GetUserDto, PutUserDto, RoleType } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantQueries, userQueries } from '../../api';
import { SelectRole } from '../../helpers/FormPickers';

const resolver = classValidatorResolver(PutUserDto);

export const EditUserGlobal = (props: { user: GetUserDto }) => {
  const { user } = props;
  const tenants = tenantQueries.useAll({});

  const navigate = useNavigate();
  const params = useParams() as {
    userId: string;
  };
  const goToView = () => navigate(`/users/${params.userId}`);
  const putUser = userQueries.usePut({
    callback: goToView,
  });
  const userFormDefaults: Partial<PutUserDto> = new PutUserDto();
  userFormDefaults.id = user.id;
  userFormDefaults.roleId = user.roleId;
  userFormDefaults.givenName = user.givenName;
  userFormDefaults.familyName = user.familyName;
  userFormDefaults.username = user.username;
  userFormDefaults.isActive = user.isActive;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm({
    resolver,
    defaultValues: userFormDefaults,
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const validatedData = data as PutUserDto;
        putUser.mutate({
          id: validatedData.id,
          roleId: validatedData.roleId,
          isActive: validatedData.isActive,
          username: validatedData.username,
          givenName: validatedData.givenName === '' ? null : validatedData.givenName,
          familyName: validatedData.familyName === '' ? null : validatedData.familyName,
        });
      })}
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
          onClick={goToView}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </form>
  );
};
