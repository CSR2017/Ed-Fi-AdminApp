import { VALIDATION_ERR_TYPE } from '@edanalytics/utils';
import { UseFormSetError } from 'react-hook-form';

export const mutationErrCallback = (setError: UseFormSetError<any>) => ({
  onError: (err: any) => {
    if (err?.type === VALIDATION_ERR_TYPE) {
      Object.entries(err?.errors ?? {}).forEach(([field, error]) => {
        setError(field as any, error as any);
      });
    } else {
      throw err;
    }
  },
});
