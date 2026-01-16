import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { ReactNode } from 'react';

// Supabase 클라이언트 모킹
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        mockOnAuthStateChange(callback);
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        };
      },
      signUp: (params: { email: string; password: string }) => mockSignUp(params),
      signInWithPassword: (params: { email: string; password: string }) => mockSignInWithPassword(params),
      signInWithOAuth: (params: { provider: string; options?: { redirectTo?: string } }) => mockSignInWithOAuth(params),
      signOut: () => mockSignOut(),
    },
  },
}));

// 테스트용 래퍼
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본 세션 응답 설정
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });
  });

  describe('Provider 렌더링', () => {
    it('AuthProvider가 올바르게 렌더링됨', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('AuthProvider 외부에서 useAuth 사용 시 에러 발생', () => {
      // console.error 숨기기
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('세션 관리', () => {
    it('초기 세션을 올바르게 로드함', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = {
        user: mockUser,
        access_token: 'test-token',
      };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('인증 상태 변화를 구독함', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      // 세션 변경 시뮬레이션
      const callback = mockOnAuthStateChange.mock.calls[0][0];
      const newSession = {
        user: { id: 'new-user', email: 'new@example.com' },
        access_token: 'new-token',
      };

      act(() => {
        callback('SIGNED_IN', newSession);
      });

      await waitFor(() => {
        expect(result.current.user?.id).toBe('new-user');
      });
    });
  });

  describe('signUp', () => {
    it('회원가입 성공', async () => {
      mockSignUp.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('test@example.com', 'password123');
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(signUpResult).toEqual({ error: null });
    });

    it('회원가입 실패 - 이미 존재하는 이메일', async () => {
      const mockError = new Error('User already exists');
      mockSignUp.mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('existing@example.com', 'password123');
      });

      expect(signUpResult).toEqual({ error: mockError });
    });
  });

  describe('signIn', () => {
    it('로그인 성공', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(signInResult).toEqual({ error: null });
    });

    it('로그인 실패 - 잘못된 비밀번호', async () => {
      const mockError = new Error('Invalid password');
      mockSignInWithPassword.mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@example.com', 'wrongpassword');
      });

      expect(signInResult).toEqual({ error: mockError });
    });
  });

  describe('signOut', () => {
    it('로그아웃 성공', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('OAuth 로그인', () => {
    it('Google OAuth 로그인 호출', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let oauthResult;
      await act(async () => {
        oauthResult = await result.current.signInWithGoogle();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      );
      expect(oauthResult).toEqual({ error: null });
    });

    it('Kakao OAuth 로그인 호출', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let oauthResult;
      await act(async () => {
        oauthResult = await result.current.signInWithKakao();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'kakao',
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      );
      expect(oauthResult).toEqual({ error: null });
    });

    it('OAuth 로그인 실패 처리', async () => {
      const mockError = new Error('OAuth failed');
      mockSignInWithOAuth.mockResolvedValue({ error: mockError });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let oauthResult;
      await act(async () => {
        oauthResult = await result.current.signInWithGoogle();
      });

      expect(oauthResult).toEqual({ error: mockError });
    });
  });

  describe('getAccessToken', () => {
    it('액세스 토큰 반환 성공', async () => {
      const mockToken = 'valid-access-token';
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: mockToken,
            user: { id: 'user-123' },
          },
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let token;
      await act(async () => {
        token = await result.current.getAccessToken();
      });

      expect(token).toBe(mockToken);
    });

    it('세션이 없을 때 null 반환', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let token;
      await act(async () => {
        token = await result.current.getAccessToken();
      });

      expect(token).toBeNull();
    });

    it('에러 발생 시 null 반환', async () => {
      // 두 번째 getSession 호출 시 에러 발생
      let callCount = 0;
      mockGetSession.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: { session: null } });
        }
        return Promise.reject(new Error('Session error'));
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let token;
      await act(async () => {
        token = await result.current.getAccessToken();
      });

      expect(token).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
