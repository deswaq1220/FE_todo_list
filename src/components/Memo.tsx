import { memoState } from '../recoil/atoms/memoState';
import { useRecoilState } from 'recoil';

const Memo = () => {
  const [memo, setMemo] = useRecoilState(memoState);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
  };
  return (
    <div className='flex flex-col'>
      <label
        htmlFor='memo'
        className='mb-2 text-base font-medium text-gray-700'
      >
        상세내용
      </label>
      <textarea
        id='memo'
        className='focus:border-todayBlue h-32 w-full resize-none rounded-lg border border-gray-300 p-3 text-gray-700 focus:outline-none'
        placeholder='메모를 입력해주세요'
        value={memo}
        onChange={handleChange}
      />
    </div>
  );
};

export default Memo;
