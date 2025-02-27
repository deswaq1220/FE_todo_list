import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react';
import AuthModal from './modal/AuthModal';
const Header = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('로그아웃 성공!~!~');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <div className='text-todayPink w-full p-4 text-right font-medium'>
        {user ? (
          <p className='cursor-pointer' onClick={handleLogout}>
            로그아웃
          </p>
        ) : (
          <p className='cursor-pointer' onClick={handleAuthClick}>
            로그인
          </p>
        )}
      </div>

      {showAuthModal && <AuthModal onClose={closeAuthModal} />}
    </>
  );
};

export default Header;
