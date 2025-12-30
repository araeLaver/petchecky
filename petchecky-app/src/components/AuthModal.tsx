"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup';

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, signInWithKakao } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
          } else {
            setError('로그인에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          onSuccess();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('이미 가입된 이메일입니다.');
          } else {
            setError('회원가입에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          setMessage('인증 메일을 발송했습니다. 이메일을 확인해주세요.');
        }
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError('Google 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setLoading(true);
    const { error } = await signInWithKakao();
    if (error) {
      setError('카카오 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 소셜 로그인 */}
        <div className="mb-6 space-y-3">
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors hover:brightness-95 disabled:opacity-50"
            style={{ backgroundColor: '#FEE500', color: '#000000' }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#000000" d="M12 3C6.477 3 2 6.463 2 10.691c0 2.722 1.8 5.108 4.5 6.454-.18.67-.65 2.428-.745 2.805-.116.464.17.457.358.332.148-.098 2.356-1.6 3.307-2.248.525.078 1.067.118 1.58.118 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/>
            </svg>
            카카오로 계속하기
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">또는</span>
          </div>
        </div>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={loading}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              계정이 없으신가요?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setMessage('');
                }}
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setMessage('');
                }}
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
