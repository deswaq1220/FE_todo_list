import PriorityBadge from './PriorityBadge';
import { useRecoilState } from 'recoil';
import { todoInputState } from '../recoil/atoms/todoState';

const AddTodo = () => {
  const [inputValue, setInputValue] = useRecoilState(todoInputState);
  return (
    <div className='flex flex-col gap-y-3'>
      <div className='flex gap-2.5'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='할 일을 입력하세요'
          className='w-full flex-2/3 rounded-lg bg-white px-4 py-2 ring-1 ring-gray-300 transition-all focus:outline-none'
        />
      </div>
      <PriorityBadge />
    </div>
  );
};

export default AddTodo;
