import { Priority, priorityState } from '../recoil/atoms/todoState';
import { useRecoilState } from 'recoil';

const PriorityBadge = () => {
  const [priority, setPriority] = useRecoilState(priorityState);

  const priorityStyles = {
    high: {
      bg: 'bg-rose-50',
      ring: 'ring-1 ring-todayPink',
      badge: 'bg-rose-500',
      hover: 'hover:bg-rose-100',
      text: 'text-todayPink',
      label: '높음',
    },
    medium: {
      bg: 'bg-amber-600/10',
      ring: 'ring-1 ring-todayYellow',
      badge: 'bg-amber-600',
      hover: 'hover:bg-amber-600/10',
      text: 'text-todayYellow',
      label: '중간',
    },
    low: {
      bg: 'bg-emerald-50',
      ring: 'ring-1 ring-todayGreen',
      badge: 'bg-emerald-500',
      hover: 'hover:bg-emerald-100',
      text: 'text-todayGreen',
      label: '낮음',
    },
  };

  return (
    <div className='flex items-center gap-4'>
      <span className='font-medium text-gray-700'>우선순위:</span>
      <div className='flex gap-2'>
        {Object.entries(priorityStyles).map(([priorityKey, style]) => (
          <button
            key={priorityKey}
            onClick={() => setPriority(priorityKey as Priority)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 transition-all ${priority === priorityKey ? style.bg : 'bg-white shadow-xs'} ${priority === priorityKey ? style.text : 'text-gray-500'} ${style.hover} ${priority === priorityKey ? style.ring : ''} cursor-pointer`}
          >
            <span className='text-sm font-medium'>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriorityBadge;
