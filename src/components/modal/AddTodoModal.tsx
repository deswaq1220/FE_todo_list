import { X } from 'lucide-react';
import AddTodo from '../AddTodo';
import Memo from '../Memo';
import { motion } from 'framer-motion';
import useAddTodo from '../../hooks/useAddTodo';
import { Calendar } from '../ui/calendar';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

type ModalProps = {
  onClose: () => void;
};

const AddTodoModal = ({ onClose }: ModalProps) => {
  const { addTodo, error } = useAddTodo();

  // 단일 날짜 대신 날짜 범위를 위한 상태
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });

  // 반복 일정 타입을 위한 상태
  const [repeatType, setRepeatType] = useState<'none' | 'range'>('none');

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 백드롭 클릭 시에도 닫게
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddTodo = async () => {
    try {
      if (!addTodo) {
        console.error('addTodo 함수가 정의되지 않았습니다');
        return;
      }

      // 여기서 선택된 날짜 범위를 addTodo에 전달
      const success = await addTodo(dateRange);
      console.log(
        'addTodo 실행 결과:',
        success,
        '선택된 날짜 범위:',
        dateRange
      ); // 디버깅용 로그

      if (success) {
        onClose();
      }
    } catch (err) {
      console.error('addTodo 실행 중 오류 발생:', err);
    }
  };

  // 날짜 형식을 보기 좋게 변환하는 함수
  const formatDateRange = () => {
    if (!dateRange?.from) return '';

    const from = dateRange.from.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!dateRange.to) return `${from}`;

    const to = dateRange.to.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `${from} ~ ${to}`;
  };

  return (
    <motion.div
      className='fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40'
      onClick={handleBackdropClick}
      initial='hidden'
      animate='visible'
      exit='hidden'
      variants={backdropVariants}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className='flex w-[600px] flex-col justify-between rounded-lg bg-white p-5 shadow-sm'
        variants={modalVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        onClick={(e: { stopPropagation: () => any }) => e.stopPropagation()}
      >
        <div className='flex flex-col gap-y-6'>
          <div className='flex justify-between'>
            <p className='text-2xl font-semibold text-gray-700'>
              새로운 할 일을 등록해주세요.
            </p>
            <motion.div className='cursor-pointer' onClick={onClose}>
              <X color='#3b475a' />
            </motion.div>
          </div>
          <AddTodo />
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <p className='text-base font-medium text-gray-700'>반복일정</p>
              <div className='flex space-x-2'>
                <button
                  className={`rounded-md px-3 py-1 text-sm ${repeatType === 'none' ? 'bg-todayPurple text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setRepeatType('none')}
                >
                  단일 날짜
                </button>
                <button
                  className={`rounded-md px-3 py-1 text-sm ${repeatType === 'range' ? 'bg-todayPurple text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setRepeatType('range')}
                >
                  기간 설정
                </button>
              </div>
            </div>

            {repeatType === 'range' && dateRange?.from && dateRange?.to && (
              <div className='text-todayPurple bg-todayPurple/10 mb-2 rounded-md p-2'>
                선택한 기간: {formatDateRange()}
              </div>
            )}

            <div className='flex items-center justify-center'>
              {repeatType === 'range' ? (
                // range 모드일 때
                <Calendar
                  mode='range'
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                  className='rounded-md border'
                />
              ) : (
                // single 모드일 때
                <Calendar
                  mode='single'
                  selected={dateRange?.from}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setDateRange({ from: date, to: date });
                    } else {
                      setDateRange(undefined);
                    }
                  }}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                  className='rounded-md border'
                />
              )}
            </div>
          </div>
          <Memo />
          {error && <p className='text-red-500'>{error}</p>}
        </div>

        <motion.button
          className='bg-todayPink mt-4 w-full cursor-pointer rounded-xl px-1.5 py-2.5 text-white'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddTodo}
        >
          등록하기
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// 배경 애니메이션 설정
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// 모달 애니메이션 설정
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export default AddTodoModal;
