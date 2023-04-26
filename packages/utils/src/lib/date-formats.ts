import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export const stdShort = (date: Date) => dayjs(date).format('l');
export const stdDetailed = (date: Date) => dayjs(date).format('lll');
