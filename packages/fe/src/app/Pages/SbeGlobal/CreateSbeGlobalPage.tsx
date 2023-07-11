import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { PostSbeDto } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { sbeQueries } from '../../api';
import { useNavToParent } from '../../helpers';
import { PageTemplate } from '../PageTemplate';

const resolver = classValidatorResolver(PostSbeDto);

export const CreateSbeGlobalPage = () => {
  const navToParentOptions = useNavToParent();
  const navigate = useNavigate();
  const postSbe = sbeQueries.usePost({});
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<PostSbeDto>({ resolver });

  return (
    <PageTemplate constrainWidth title={'Create Environment'} actions={undefined}>
      <Box w="20em">
        <form
          onSubmit={handleSubmit((data) =>
            postSbe.mutate(
              {
                ...data,
              },
              {
                onSuccess: (result) => {
                  navigate(`/sbes/${result.id}`);
                },
              }
            )
          )}
        >
          <FormControl isInvalid={!!errors.envLabel}>
            <FormLabel>Environment label</FormLabel>
            <Input {...register('envLabel')} placeholder="envlabel" />
            <FormErrorMessage>{errors.envLabel?.message}</FormErrorMessage>
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
      </Box>
    </PageTemplate>
  );
};
