import { useParams } from 'react-router-dom';
import { sbeQueries } from '../../api';
import { SbeCard } from './SbeCard';

export const SbesCardList = () => {
  const params = useParams() as { asId: string };

  const sbes = sbeQueries.useAll({ optional: true, tenantId: params.asId });
  const sbesArr = Object.values(sbes.data ?? {});

  return sbesArr.length ? (
    <>
      {sbesArr.map((sbe) => (
        <SbeCard sbe={sbe} key={sbe.id} />
      ))}
    </>
  ) : (
    <>Nothing here</>
  );
};
