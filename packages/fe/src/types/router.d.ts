import { router } from '../app/routes';

declare module '@tanstack/router' {
  interface Register {
    router: typeof router;
  }
}
