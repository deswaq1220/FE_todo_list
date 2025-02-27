import { useState } from 'react';

import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtiles';
import MonthNavigator from './MonthNavigator';
import { selectedDateState } from '../recoil/atoms/dateState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { todoListState } from '../recoil/atoms/todoState';

const Calender = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);

  const todos = useRecoilValue(todoListState);

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const days = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  // 날짜별 투두 개수를 계산하는 함수
  const getTodoCountForDate = (date: Date) => {
    return todos.filter((todo) => {
      // startDate가 없으면 제외
      if (!todo.startDate) return false;

      const startDate = new Date(todo.startDate);
      // endDate가 없으면 startDate와 같은 날짜로 처리
      const endDate = todo.endDate
        ? new Date(todo.endDate)
        : new Date(todo.startDate);

      // 날짜 비교를 위해 시간 부분을 제거
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      const compareStart = new Date(startDate);
      compareStart.setHours(0, 0, 0, 0);

      const compareEnd = new Date(endDate);
      compareEnd.setHours(0, 0, 0, 0);

      // 해당 날짜가 투두의 시작일과 종료일 사이에 있는지 확인
      return (
        compareDate.getTime() >= compareStart.getTime() &&
        compareDate.getTime() <= compareEnd.getTime()
      );
    }).length;
  };

  // 선택된 월의 총 투두 개수
  const totalTodosInMonth = todos.filter((todo) => {
    // startDate가 없으면 제외
    if (!todo.startDate) return false;

    const startDate = new Date(todo.startDate);
    // endDate가 없으면 startDate와 같은 날짜로 처리
    const endDate = todo.endDate
      ? new Date(todo.endDate)
      : new Date(todo.startDate);

    // 현재 월의 첫째날과 마지막날
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // 투두 기간이 현재 월과 겹치는지 확인
    return startDate <= lastDayOfMonth && endDate >= firstDayOfMonth;
  }).length;

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    if (currentMonth === 0) setCurrentYear((prevYear) => prevYear - 1);
    // 월이 변경되면 날짜 선택을 초기화
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    if (currentMonth === 11) setCurrentYear((prevYear) => prevYear + 1);
    // 월이 변경되면 날짜 선택을 초기화
    setSelectedDate(null);
  };

  // 날짜 선택 핸들러
  const handleDateClick = (day: Date) => {
    // 이미 선택된 날짜를 다시 클릭하면 선택 해제
    if (
      selectedDate &&
      selectedDate.getDate() === day.getDate() &&
      selectedDate.getMonth() === day.getMonth() &&
      selectedDate.getFullYear() === day.getFullYear()
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(day);
    }
  };

  // 날짜가 선택되었는지 확인하는 함수
  const isDateSelected = (day: Date) => {
    return (
      selectedDate &&
      selectedDate.getDate() === day.getDate() &&
      selectedDate.getMonth() === day.getMonth() &&
      selectedDate.getFullYear() === day.getFullYear()
    );
  };

  return (
    <>
      <p className='text-xl'>
        {new Date(currentYear, currentMonth).toLocaleString('default', {
          month: 'long',
        })}
        엔 {totalTodosInMonth}개의 투두가 작성되었어요.
      </p>
      <p className='mb-5 text-xl'>
        {selectedDate
          ? `${selectedDate.getDate()}일의 투두를 확인해보세요📝`
          : '오늘의 투두를 작성해보세요😊'}
      </p>
      <div className='overflow-hidden rounded-lg bg-white shadow-md'>
        <MonthNavigator
          currentYear={currentYear}
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <div className='mt-10 grid grid-cols-7 text-center text-xs leading-6 text-gray-500'>
          <div>일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div>토</div>
        </div>
        <div className='mt-2 grid grid-cols-7 text-sm'>
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className='py-2'></div>
          ))}
          {days.map((day) => {
            const todoCount = getTodoCountForDate(day);
            const isToday =
              todayDate === day.getDate() &&
              todayMonth === currentMonth &&
              todayYear === currentYear;
            const isSelected = isDateSelected(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`cursor-pointer py-2 hover:bg-gray-100 ${
                  isToday ? 'text-todayPink font-bold' : ''
                } ${isSelected ? 'bg-todayPink/10' : ''}`}
              >
                <div className='relative mx-auto flex h-8 w-8 items-center justify-center rounded-full'>
                  <time dateTime={day.toISOString()}>{day.getDate()}</time>
                  {todoCount > 0 && (
                    <span className='bg-todayPink absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white'>
                      {todoCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Calender;
