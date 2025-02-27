import { Plus } from 'lucide-react';
import Calender from '../components/Calender';
import SearchInput from '../components/SearchInput';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import AddTodoModal from '../components/modal/AddTodoModal';
import TodoList from '../components/TodoList';
import Header from '../components/Header';

const MainPage = () => {
  const [isAddTodoModalOpen, setIsAddTodoModalOpen] = useState(false);

  const handleAddTodoModal = () => {
    setIsAddTodoModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddTodoModalOpen(false);
  };

  return (
    <>
      <div className='relative h-screen w-full'>
        <div className='container mx-auto sm:px-6 lg:px-8'>
          <Header />
          <div className='mt-[100px] flex h-auto w-full'>
            <div className='h-96 w-[600px] border-r border-gray-200 p-5'>
              <Calender />
            </div>
            <div className='h-[850px] w-full overflow-y-auto p-5'>
              <div className='flex gap-x-1.5'>
                <SearchInput />
                <button
                  className='bg-todayPink flex cursor-pointer rounded-lg px-4 py-2 text-white'
                  onClick={handleAddTodoModal}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Plus />
                  </motion.div>
                </button>
              </div>
              <TodoList />
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isAddTodoModalOpen && <AddTodoModal onClose={handleCloseModal} />}
      </AnimatePresence>
    </>
  );
};

export default MainPage;
