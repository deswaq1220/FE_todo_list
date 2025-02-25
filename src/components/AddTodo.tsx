import { priorityState, Todo } from '../recoil/atoms/todoState';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import PriorityBadge from './PriorityBadge';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { database } from '../firebase/firebase';
function AddTodo() {
  const [inputValue, setInputValue] = useState('');
  const priority = useRecoilValue(priorityState);

  const addTodo = async () => {
    if (inputValue.trim() !== '') {
      try {
        const newTodo: Todo = {
          id: Date.now(),
          text: inputValue,
          isComplete: false,
          priority: priority,
          order: length,
          createdAt: new Date().toISOString(),
        };
        //파이어베이스에 저장하기
        const docRef = await addDoc(collection(database, 'todos'), {
          text: inputValue,
          isComplete: false,
          priority: priority,
          createdAt: serverTimestamp(),
        });
        // 파이어베이스에 생성된 아이디로 업데이트
        newTodo.firebaseId = docRef.id;

        setInputValue('');

        console.log('저장됐다!');
      } catch (error) {
        console.error('저장오류', error);
      }
    }
  };

  return (
    <div className='flex flex-col gap-y-2'>
      <div className='flex gap-2.5'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='새로운 할 일을 입력하세요'
          className='w-full flex-2/3 rounded-lg bg-white px-4 py-2 ring-1 ring-gray-200 transition-all focus:outline-none'
        />
        <button
          className='cursor-pointer rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600'
          onClick={addTodo}
        >
          <Plus />
        </button>
      </div>
      <PriorityBadge />
    </div>
  );
}

export default AddTodo;
