import { router } from '../src/app/Routes';

declare module '@tanstack/router' {
  interface Register {
    router: typeof router;
  }
}
