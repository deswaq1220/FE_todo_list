import { atom } from 'recoil';

export type Priority = 'high' | 'medium' | 'low';

export type Todo = {
  id: number;
  firebaseId?: string;
  text: string;
  isComplete: boolean;
  priority: Priority;
  notes?: string;
  order?: number | undefined;
  createdAt?: string;
};

// export const todoListState = atom<Todo[]>({
//   key: 'todoListState',
//   default: [],
// });

//우선 순위 상태
export const priorityState = atom<Priority>({
  key: 'priorityState',
  default: 'medium',
});
