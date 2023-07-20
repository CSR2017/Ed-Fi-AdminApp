import { registerDecorator } from 'class-validator';
import { validate as validateArn } from '@aws-sdk/util-arn-parser';

const validate = (value: any) => {
  return validateArn(value) || 'Invalid Amazon Resource Name';
};

export function IsArn() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isArn',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: (args) => validate(args.value) as string,
      },
      validator: {
        validate: (value) => (validate(value) === true ? true : false),
      },
    });
  };
}
