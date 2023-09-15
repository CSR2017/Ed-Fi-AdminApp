import {
  IWorkflowFailureErrors,
  StatusType,
  isFormValidationResponse,
  isWorkflowFailureResponse,
} from '@edanalytics/utils';
import { isValidElement } from 'react';
import { UseFormSetError } from 'react-hook-form';

/**
 * Populate `onError` with standard error surfacing behavior. Uses form state if available, otherwise pops a banner.
 * - Explicit form validation errors
 * - Explicit workflow errors
 * - General HTTP errors _(ignore these using the `picky` flag)_
 *
 * One special case:
 * - If the error message has JSX in it, then it goes to the banner even if form state is available because
 *   the banner accepts that but form state doesn't. The string title still goes to form state too so as to not
 *   break react-hook-form's possible reliance on it.
 *
 * Note: wherever the API has explicit validation logic or error handling, it mostly returns the special
 * form validation or workflow errors, as appropriate. The generic HTTP failures are left for cases in which
 * either (a) errors aren't handled by any explicit logic (so the initial exception goes all the way to Nest's
 * catcher), or (b) there's nothing we want to say or do about the error (e.g. a 404).
 *
 * */
export const mutationErrCallback = ({
  setError,
  popBanner,
  picky,
}: {
  setError?: UseFormSetError<any>;
  popBanner?: (banner: IWorkflowFailureErrors) => void;
  /** Only pop banners for explicitly surfaced errors (not general 500s and 400s) */
  picky?: boolean;
}) => ({
  onError: (err: any) => {
    // Special response type for react-hook-form validation errors
    if (setError && isFormValidationResponse(err)) {
      Object.entries(err?.errors ?? {}).forEach(([field, error]) => {
        setError(field as any, error as any);
      });

      // Special response type for explicit error or status messages
    } else if (isWorkflowFailureResponse(err)) {
      if ((!setError || isValidElement(err.errors.message)) && popBanner) {
        popBanner(err.errors);
      }

      if (setError) {
        setError('root', {
          message:
            err.errors.title + typeof err.errors.message === 'string'
              ? '. ' + err.errors.message
              : '',
        });
      }

      // General HTTP errors
    } else if (!picky && err.statusCode && err.message) {
      if (setError) {
        setError('root', { message: err.statusCode + ': ' + err.message });
      } else if (popBanner) {
        popBanner({ title: err.message, status: StatusType.error });
      }
    } else {
      throw err;
    }
  },
});
