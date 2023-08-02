import { ValidationError } from 'class-validator';
import { FieldErrors } from 'react-hook-form';

/**
 * Turn class-validator errors into hook-form errors.
 *
 * Stolen from class-validator's [hook form resolver](../../../../node_modules/@hookform/resolvers/class-validator/src/class-validator.ts),
 * which for some reason doesn't export this perfectly useful utility.
 */
export const formErrFromValidator = (
  errors: ValidationError[],
  parsedErrors: FieldErrors = {},
  path = ''
) => {
  return errors.reduce((acc, error) => {
    const _path = path ? `${path}.${error.property}` : error.property;

    if (error.constraints) {
      const key = Object.keys(error.constraints)[0];
      acc[_path] = {
        type: key,
        message: error.constraints[key],
      };

      const _e = acc[_path];
      if (_e) {
        Object.assign(_e, { types: error.constraints });
      }
    }

    if (error.children && error.children.length) {
      formErrFromValidator(error.children, acc, _path);
    }

    return acc;
  }, parsedErrors);
};

export const VALIDATION_ERR_TYPE = 'ValidationError';
