import {
  ErrorCode,
  IWorkflowFailureErrors,
  VALIDATION_RESP_TYPE,
  WORKFLOW_FAILURE_RESP_TYPE,
  formErrFromValidator,
} from '@edanalytics/utils';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { FieldErrors } from 'react-hook-form';

export class ValidationException extends BadRequestException {
  constructor(errors: FieldErrors) {
    super({
      message: 'Invalid submission.',
      type: VALIDATION_RESP_TYPE,
      errors,
    });
  }
}

/**
 * Exception to surface a validation message using react-hook-form state. See [the front-end's handler](../../../../packages/fe/src/app/helpers/mutationErrCallback.ts) for them.
 *
 * @example throw new FormValidationException('Some error message for the root');
 *
 * @example throw new FormValidationException({field: 'fieldOne', message: 'Some message for a field'});
 */
export class FormValidationException extends BadRequestException {
  constructor(error: { field: string; message: string });
  constructor(error: string);
  constructor(error: string | { field: string; message: string }) {
    if (typeof error === 'string') {
      super({
        message: 'Invalid submission.',
        type: VALIDATION_RESP_TYPE,
        errors: {
          root: {
            message: error,
          },
        },
      });
    } else {
      const err = new ValidationError();
      err.property = error.field;
      err.constraints = {
        server: error.message,
      };
      err.value = false;
      super({
        message: 'Invalid submission.',
        type: VALIDATION_RESP_TYPE,
        errors: formErrFromValidator([err]),
      });
    }
  }
}

export class WorkflowFailureException extends InternalServerErrorException {
  constructor(errors: IWorkflowFailureErrors, code?: ErrorCode) {
    super({
      message: 'Operation failure',
      type: WORKFLOW_FAILURE_RESP_TYPE,
      ...(code ? { code } : {}),
      errors,
    });
  }
}
