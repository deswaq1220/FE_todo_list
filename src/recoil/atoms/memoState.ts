import { atom } from 'recoil';

// 메모 상태
export const memoState = atom<string>({
  key: 'memoState',
  default: '',
});
