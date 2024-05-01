import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  chakra,
} from '@chakra-ui/react';
import { GetSbEnvironmentDto, PutSbEnvironmentMeta } from '@edanalytics/models';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { usePopBanner } from '../../Layout/FeedbackBanner';

import { noop } from '@tanstack/react-table';
import { mutationErrCallback } from '../../helpers/mutationErrCallback';
import { sbEnvironmentQueries, sbEnvironmentQueriesGlobal } from '../../api';

const resolver = classValidatorResolver(PutSbEnvironmentMeta);

export const EditSbEnvironmentMeta = (props: { sbEnvironment: GetSbEnvironmentDto }) => {
  const popBanner = usePopBanner();

  const navigate = useNavigate();
  const goToView = () => navigate(`/sb-environments/${props.sbEnvironment.id}`);
  const putSbEnvironment = sbEnvironmentQueriesGlobal.registerMeta({});
  const { sbEnvironment } = props;
  const sbEnvironmentFormDefaults: PutSbEnvironmentMeta = {
    id: sbEnvironment.id,
    arn: sbEnvironment.configPublic?.sbEnvironmentMetaArn,
  };
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PutSbEnvironmentMeta>({ resolver, defaultValues: sbEnvironmentFormDefaults });

  return sbEnvironment ? (
    <chakra.form
      w="form-width"
      onSubmit={handleSubmit((data) =>
        putSbEnvironment
          .mutateAsync(
            { entity: data, pathParams: null },
            {
              ...mutationErrCallback({ popGlobalBanner: popBanner, setFormError: setError }),
              onSuccess: goToView,
            }
          )
          .catch(noop)
      )}
    >
      <FormControl isInvalid={!!errors.arn}>
        <FormLabel>Metadata ARN</FormLabel>
        <Input {...register('arn')} placeholder="arn:aws:lambda:us..." />
        <FormErrorMessage>{errors.arn?.message}</FormErrorMessage>
      </FormControl>
      <ButtonGroup>
        <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
          Connect
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
      {errors.root?.message ? (
        <Text mt={4} color="red.500">
          {errors.root?.message}
        </Text>
      ) : null}
    </chakra.form>
  ) : null;
};
