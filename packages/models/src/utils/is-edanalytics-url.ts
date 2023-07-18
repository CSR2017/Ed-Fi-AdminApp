import { registerDecorator } from 'class-validator';

const validate = (value: any) => {
  console.log('value', value);

  try {
    const url = new URL(value);
    if (url.hostname.replace(/\/$/, '').endsWith('.edanalytics.org')) {
      return true;
    } else {
      return 'URL is not an edanalytics.org domain.';
    }
  } catch (UrlErr) {
    return 'You need to supply a valid URL.';
  }
};

export function IsEdanalyticsUrl() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isEdanalyticsUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: (args) => {
          console.log(args);
          return validate(args.value) as any;
        },
      },
      validator: {
        validate: (value) => (validate(value) === true ? true : false),
      },
    });
  };
}
