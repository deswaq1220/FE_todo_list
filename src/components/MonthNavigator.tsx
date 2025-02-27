import { ChevronLeft, ChevronRight } from 'lucide-react';

type MonthNavigatorProps = {
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const MonthNavigator = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: MonthNavigatorProps) => {
  return (
    <div className='bg-todayPink flex h-14 w-full items-center px-4'>
      <h2 className='flex-auto text-sm font-semibold text-white'>
        {new Date(currentYear, currentMonth).toLocaleString('default', {
          month: 'long',
        })}{' '}
        {currentYear}
      </h2>
      <button
        type='button'
        className='hover:text-todayNavy -my-1.5 flex flex-none items-center justify-center p-1.5 text-white'
        onClick={onPrevMonth}
      >
        <ChevronLeft className='h-5 w-5' aria-hidden='true' />
      </button>
      <button
        type='button'
        className='hover:text-todayNavy -my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-white'
        onClick={onNextMonth}
      >
        <ChevronRight className='h-5 w-5' aria-hidden='true' />
      </button>
    </div>
  );
};

export default MonthNavigator;
