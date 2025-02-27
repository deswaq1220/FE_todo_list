import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import googleIcon from '../../assets/web_light_rd_na.svg';
import { useState } from 'react';
import AuthInput from '../AuthInput';
import { useAuth } from '../../hooks/useAuth';

export const loginFormSchema = zod.object({
  email: zod.string().email({ message: '이메일 형식이 아닙니다.' }),
  password: zod.string().min(1, { message: '비밀번호를 입력해주세요.' }),
});

export const signupFormSchema = zod
  .object({
    email: zod.string().email({ message: '이메일 형식이 아닙니다.' }),
    password: zod
      .string()
      .min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
    confirmPassword: zod
      .string()
      .min(1, { message: '비밀번호 확인을 입력해주세요.' }),
    nickname: zod.string().min(1, { message: '닉네임을 입력해주세요.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type LoginFormValues = zod.infer<typeof loginFormSchema>;
type SignupFormValues = zod.infer<typeof signupFormSchema>;

const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);

  const { signup, login, googleLogin, loading, error } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onSubmit',
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
    },
    mode: 'onSubmit',
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      const user = await login({
        email: data.email,
        password: data.password,
      });
      console.log('로그인 성공:', user);
      onClose();
      // 로그인 성공 후 처리 (예: 모달 닫기, 리다이렉트 등)
    } catch (err) {
      console.error('로그인 실패:', err);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      const user = await signup({
        email: data.email,
        password: data.password,
        nickname: data.nickname,
      });
      console.log('회원가입 성공:', user);
      setIsLogin(true); // 로그인 모드로 전환
    } catch (err) {
      console.error('회원가입 실패:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await googleLogin();
      console.log('구글 로그인 성공:', user);

      onClose();
    } catch (err) {
      console.error('구글 로그인 실패:', err);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40'
      onClick={handleBackdropClick}
    >
      <div className='flex h-[600px] w-[400px] flex-col justify-between rounded-lg bg-white p-6 shadow-sm'>
        <div>
          <p className='mb-6 text-center text-2xl font-semibold text-gray-700'>
            {isLogin ? '로그인' : '회원가입'}
          </p>

          {error && (
            <div className='mb-4 rounded-md bg-red-100 p-2 text-sm text-red-600'>
              {error}
            </div>
          )}

          {isLogin ? (
            <FormProvider {...loginForm}>
              <form
                id='loginForm'
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className='flex flex-col gap-3.5'
              >
                <AuthInput
                  label='이메일'
                  type='email'
                  placeholder='이메일을 입력하세요'
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <span className='text-todayRed'>
                    {loginForm.formState.errors.email.message}
                  </span>
                )}

                <AuthInput
                  label='비밀번호'
                  type='password'
                  placeholder='비밀번호를 입력하세요'
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <span className='text-todayRed'>
                    {loginForm.formState.errors.password.message}
                  </span>
                )}
              </form>
            </FormProvider>
          ) : (
            <FormProvider {...signupForm}>
              <form
                id='signupForm'
                onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                className='flex flex-col gap-3.5'
              >
                <AuthInput
                  label='이메일'
                  type='email'
                  placeholder='이메일을 입력하세요'
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <span className='text-todayRed'>
                    {signupForm.formState.errors.email.message}
                  </span>
                )}

                <AuthInput
                  label='닉네임'
                  type='text'
                  placeholder='닉네임을 입력하세요'
                  {...signupForm.register('nickname')}
                />
                {signupForm.formState.errors.nickname && (
                  <span className='text-todayRed'>
                    {signupForm.formState.errors.nickname.message}
                  </span>
                )}

                <AuthInput
                  label='비밀번호'
                  type='password'
                  placeholder='비밀번호를 입력하세요'
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <span className='text-todayRed'>
                    {signupForm.formState.errors.password.message}
                  </span>
                )}

                <AuthInput
                  label='비밀번호 확인'
                  type='password'
                  placeholder='비밀번호를 확인하세요'
                  {...signupForm.register('confirmPassword')}
                />
                {signupForm.formState.errors.confirmPassword && (
                  <span className='text-todayRed'>
                    {signupForm.formState.errors.confirmPassword.message}
                  </span>
                )}
              </form>
            </FormProvider>
          )}
        </div>

        <div className='mt-4 flex flex-col gap-y-2.5'>
          <div
            onClick={toggleForm}
            className='cursor-pointer py-2.5 text-center'
          >
            {isLogin ? (
              <span className='text-gray-400'>
                회원이 아니신가요?{' '}
                <span className='text-todayPink font-medium'>회원가입</span>
              </span>
            ) : (
              <span className='text-gray-400'>
                회원이신가요?{' '}
                <span className='text-todayPink font-medium'>로그인</span>
              </span>
            )}
          </div>
          <button
            className='bg-todayPink w-full cursor-pointer rounded-xl px-4 py-2.5 text-white'
            type='submit'
            form={isLogin ? 'loginForm' : 'signupForm'}
            disabled={loading}
          >
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
          {isLogin && (
            <div
              onClick={handleGoogleSignIn}
              className='text-todayNavy mt-4 flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-xl px-4 py-2.5'
            >
              <img src={googleIcon} alt='googleIcon' />
              <p>google로 계속하기</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
