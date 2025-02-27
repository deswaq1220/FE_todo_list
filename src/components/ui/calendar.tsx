import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DayPicker,
  DayPickerRangeProps,
  DayPickerSingleProps,
} from 'react-day-picker';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../../components/ui/button';

type CalendarProps =
  | (Omit<DayPickerSingleProps, 'mode'> & { mode: 'single' })
  | (Omit<DayPickerRangeProps, 'mode'> & { mode: 'range' });

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('w-full p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row sm:justify-between w-full',
        month: 'flex flex-col gap-4 sm:w-[48%]',
        caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-x-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-todayPink/10 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_start:
          'day-range-start aria-selected:bg-todayPink aria-selected:text-white',
        day_range_end:
          'day-range-end aria-selected:bg-todayPink aria-selected:text-white',
        day_selected:
          'bg-todayPink text-white hover:todayPink hover:text-white focus:bg-todayPink focus:text-white',
        day_today: 'bg-todayPink/10 text-todayPink',
        day_outside:
          'day-outside text-muted-foreground aria-selected:text-white',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-todayPink/10 aria-selected:text-todayPink',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('size-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('size-4', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
