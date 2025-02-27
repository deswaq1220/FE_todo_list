import {
  priorityState,
  Todo,
  todoInputState,
  todoListState,
} from '../recoil/atoms/todoState';
import { auth, database } from '../firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { memoState } from '../recoil/atoms/memoState';
import { useAuthState } from 'react-firebase-hooks/auth';
import { DateRange } from 'react-day-picker';

const useAddTodo = () => {
  const [inputValue, setInputValue] = useRecoilState(todoInputState);
  const [memo, setMemo] = useRecoilState(memoState);
  const setTodoList = useSetRecoilState(todoListState);
  const [user] = useAuthState(auth);

  const priority = useRecoilValue(priorityState);

  const [error, setError] = useState<string | null>(null);

  const addTodo = async (dateRange?: DateRange): Promise<boolean> => {
    if (!user) {
      setError('로그인이 필요합니다');
      return false;
    }
    if (inputValue.trim() !== '') {
      try {
        // 날짜 범위 처리
        const startDate = dateRange?.from
          ? dateRange.from.toISOString()
          : new Date().toISOString();
        const endDate = dateRange?.to ? dateRange.to.toISOString() : startDate;
        const repeatType =
          dateRange?.to && dateRange.from !== dateRange.to ? 'range' : 'none';

        // 파이어베이스에 저장하기
        const docRef = await addDoc(collection(database, 'todos'), {
          text: inputValue,
          isComplete: false,
          priority: priority,
          notes: memo,
          userId: user.uid,
          createdAt: serverTimestamp(),
          startDate: startDate,
          endDate: endDate,
          repeatType: repeatType,
        });

        // 새 할일 객체 생성하기
        const newTodo: Todo = {
          id: Date.now(),
          firebaseId: docRef.id,
          text: inputValue,
          isComplete: false,
          notes: memo,
          priority: priority,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          order: 0, // 임시값, 아래에서 업데이트됨
          startDate: startDate,
          endDate: endDate,
          repeatType: repeatType,
        };

        setTodoList((oldTodoList) => {
          // order는 현재 목록의 길이로 설정
          newTodo.order = oldTodoList.length;
          return [...oldTodoList, newTodo];
        });

        // 입력값 초기화
        setInputValue('');
        setMemo('');
        setError(null);
        console.log('저장됐다!');
        return true;
      } catch (error) {
        setError('저장오류');
        console.error('저장오류', error);
        return false;
      }
    }
    return false;
  };

  return { inputValue, setInputValue, memo, setMemo, addTodo, error };
};

export default useAddTodo;
