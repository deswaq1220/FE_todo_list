import { searchState } from '../recoil/atoms/searchState';
import { Search } from 'lucide-react';
import { useRecoilState } from 'recoil';
const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useRecoilState(searchState);
  return (
    <div className='relative'>
      <Search className='absolute top-2.5 left-3 h-5 w-5 text-gray-400' />
      <input
        type='text'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='할 일 검색'
        className='w-full rounded-lg bg-white py-2 pr-4 pl-10 ring-1 ring-gray-200 transition-all focus:outline-none'
      />
    </div>
  );
};

export default SearchInput;
