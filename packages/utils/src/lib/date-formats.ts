import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export const stdShort = (date: Date | undefined) =>
  date === undefined ? '-' : dayjs(date).format('l');
export const stdDetailed = (date: Date | undefined) =>
  date === undefined ? '-' : dayjs(date).format('lll');
