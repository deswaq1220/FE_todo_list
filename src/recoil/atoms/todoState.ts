import { atom } from 'recoil';

export type Priority = 'high' | 'medium' | 'low';

export type Todo = {
  id: number;
  userId: string;
  firebaseId?: string;
  text: string;
  isComplete: boolean;
  priority: Priority;
  notes?: string;
  order?: number | undefined;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  repeatType?: 'none' | 'range';
};

export const todoListState = atom<Todo[]>({
  key: 'todoListState',
  default: [],
});

export const todoInputState = atom<string>({
  key: 'todoInputState',
  default: '',
});

export const activeNotesIdState = atom<string | null>({
  key: 'activeNotesIdState',
  default: null,
});

//우선 순위 상태
export const priorityState = atom<Priority>({
  key: 'priorityState',
  default: 'medium',
});
