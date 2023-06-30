import { RouteObject } from 'react-router-dom';
import { SecretPage } from '../Pages/Secret/SecretPage';

export const secretRoute: RouteObject = {
  path: 'secret/:uuid/:key',
  element: <SecretPage />,
};
