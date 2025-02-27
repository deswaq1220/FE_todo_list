import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

interface SignupData {
  email: string;
  password: string;
  nickname?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async ({ email, password, nickname }: SignupData) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 닉네임이 제공된 경우 프로필 업데이트
      if (nickname && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: nickname,
        });
      }

      setLoading(false);
      return userCredential.user;
    } catch (err: any) {
      setLoading(false);

      // 에러 메시지 가독성 향상
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.';
      }

      setError(errorMessage);
      throw err;
    }
  };

  const login = async ({ email, password }: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setLoading(false);
      return userCredential.user;
    } catch (err: any) {
      setLoading(false);

      // 에러 메시지 가독성 향상
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage =
          '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      }

      setError(errorMessage);
      throw err;
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setLoading(false);
      return result.user;
    } catch (error: any) {
      setLoading(false);
      setError('구글 로그인 중 오류가 발생했습니다.');
      throw error;
    }
  };

  return {
    signup,
    login,
    googleLogin,
    loading,
    error,
  };
};
