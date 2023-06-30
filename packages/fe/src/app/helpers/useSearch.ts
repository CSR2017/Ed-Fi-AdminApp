import { useSearchParams } from 'react-router-dom';

export const useSearchParamsObject = () => {
  const [urlSearchParams] = useSearchParams();
  return [...urlSearchParams.entries()].reduce<Record<string, any>>(
    (obj, entry) => {
      const [key, value] = entry;
      if (key in obj) {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key]];
        }
        obj[key].push(value);
      } else {
        obj[key] = value;
      }
      return obj;
    },
    {}
  );
};
