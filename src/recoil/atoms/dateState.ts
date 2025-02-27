import { atom } from 'recoil';

export const selectedDateState = atom<Date | null>({
  key: 'selectedDateState',
  default: null,
});
