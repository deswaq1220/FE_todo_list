import { RecoilRoot } from 'recoil';
import AddTodo from './components/AddTodo';
import SearchInput from './components/SearchInput';
import TodoList from './components/TodoList';

function App() {
  return (
    <RecoilRoot>
      <div className='flex h-screen w-full justify-center bg-gray-50'>
        <div className='w-[700px] p-5'>
          <h1 className='mb-2 text-2xl'>투두네이션</h1>
          <div className='flex flex-col gap-y-3'>
            <SearchInput />
            <AddTodo />
            <TodoList />
          </div>
        </div>
      </div>
    </RecoilRoot>
  );
}

export default App;
