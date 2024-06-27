import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from '@chakra-ui/react';
import { PageTemplate, ToggleButtonGroup } from '@edanalytics/common-ui';
import { PostSbEnvironmentDto } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { noop } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePopBanner } from '../../Layout/FeedbackBanner';
import { sbEnvironmentQueries } from '../../api';
import { popSyncBanner, useNavToParent } from '../../helpers';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';

const resolver = classValidatorResolver(PostSbEnvironmentDto);

export const CreateSbEnvironmentGlobalPage = () => {
  const popBanner = usePopBanner();
  const navToParentOptions = useNavToParent();
  const navigate = useNavigate();
  const postSbEnvironment = sbEnvironmentQueries.post({});
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostSbEnvironmentDto>({
    resolver,
    defaultValues: Object.assign(new PostSbEnvironmentDto(), { metaArn: undefined }),
  });

  return (
    <PageTemplate constrainWidth title={'Connect new environment'} actions={undefined}>
      <Box w="form-width">
        <form
          onSubmit={handleSubmit((data) =>
            postSbEnvironment
              .mutateAsync(
                { entity: data },
                {
                  onSuccess: (result) => {
                    navigate(`/sb-environments/${result.id}`);
                    result.syncQueue &&
                      popSyncBanner({
                        popBanner,
                        syncQueue: result.syncQueue,
                      });
                  },
                  ...mutationErrCallback({ setFormError: setError, popGlobalBanner: popBanner }),
                }
              )
              .catch(noop)
          )}
        >
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Input {...register('name')} placeholder="name" />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.metaArn}>
            <FormLabel>Metadata ARN</FormLabel>
            <Input {...register('metaArn')} placeholder="arn:aws:lambda:us..." />
            <FormErrorMessage>{errors.metaArn?.message}</FormErrorMessage>
          </FormControl>
          <ButtonGroup mt={4} colorScheme="primary">
            <Button isLoading={isSubmitting} type="submit">
              Save
            </Button>
            <Button
              variant="ghost"
              isLoading={isSubmitting}
              type="reset"
              onClick={() => {
                navigate(navToParentOptions);
              }}
            >
              Cancel
            </Button>
          </ButtonGroup>
          {errors.root?.message ? (
            <Text mt={4} color="red.500">
              {errors.root?.message}
            </Text>
          ) : null}
        </form>
      </Box>
    </PageTemplate>
  );
};
