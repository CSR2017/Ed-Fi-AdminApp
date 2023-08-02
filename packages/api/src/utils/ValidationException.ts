import { VALIDATION_ERR_TYPE } from '@edanalytics/utils';
import { BadRequestException } from '@nestjs/common';
import { FieldErrors } from 'react-hook-form';

export class ValidationException extends BadRequestException {
  constructor(errors: FieldErrors) {
    super({
      message: 'Invalid submission.',
      type: VALIDATION_ERR_TYPE,
      errors,
    });
  }
}
