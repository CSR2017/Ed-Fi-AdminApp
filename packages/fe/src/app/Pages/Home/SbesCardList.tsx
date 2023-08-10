import { sbeQueries } from '../../api';
import { useNavContext } from '../../helpers';
import { SbeCard } from './SbeCard';

export const SbesCardList = () => {
  const asId = useNavContext().asId!;

  const sbes = sbeQueries.useAll({ optional: true, tenantId: asId });
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
