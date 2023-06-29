import {
  Alert,
  AlertDescription,
  AlertIcon,
  CloseButton,
  FormControl,
  FormLabel,
  Switch,
  useBoolean,
} from '@chakra-ui/react';
import { GetSbeDto } from '@edanalytics/models';
import { useEffect } from 'react';
import { useSbeCheckConnection } from '../../api';
import { RegisterSbeAdminApiAuto } from './RegisterSbeAdminApiAuto';
import { RegisterSbeAdminApiManual } from './RegisterSbeAdminApiManual';

export const RegisterSbeAdminApi = (props: { sbe: GetSbeDto }) => {
  const [showIsRegisteredWarning, setIsRegistered] = useBoolean(false);
  const checkConnection = useSbeCheckConnection();
  useEffect(() => {
    checkConnection.mutateAsync(sbe).then((result) => {
      if (result.statuses.find((s) => s.name === 'Admin API' && s.success)) {
        setIsRegistered.on();
      }
    });
  }, []);
  const { sbe } = props;

  const [selfRegister, setSelfRegister] = useBoolean(true);

  return sbe ? (
    <>
      {showIsRegisteredWarning && (
        <Alert status="warning" mb="2em">
          <AlertIcon />
          <AlertDescription flexGrow={1}>
            This environment is already registered with the Admin API. Are you
            sure you want to try creating another client?
          </AlertDescription>
          <CloseButton onClick={setIsRegistered.off} />
        </Alert>
      )}
      <FormControl mb={10}>
        <FormLabel>Use automatic self-registration?</FormLabel>
        <Switch isChecked={selfRegister} onChange={setSelfRegister.toggle} />
      </FormControl>
      {selfRegister ? (
        <RegisterSbeAdminApiAuto sbe={sbe} />
      ) : (
        <RegisterSbeAdminApiManual sbe={sbe} />
      )}
    </>
  ) : null;
};
