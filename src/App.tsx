import { RecoilRoot } from 'recoil';
import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/mainPage';

function App() {
  return (
    <RecoilRoot>
      <Routes>
        <Route path='/' element={<MainPage />} />
      </Routes>
    </RecoilRoot>
  );
}

export default App;
