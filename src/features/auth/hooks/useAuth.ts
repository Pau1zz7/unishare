import { useState } from 'react';
import { login, register, logout, sendPasswordReset } from '../services/authService';
import { useAuthStore } from '../../../store/useAuthStore';
import { RegisterInput } from '../../../types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser, clearUser } = useAuthStore();

  // Xử lý Đăng nhập
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await login(email, password);
      setUser(userData); // Lưu vào Zustand Store
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng ký
  const handleRegister = async (input: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      await register(input);
      // Đăng ký thành công nhưng chưa login (cần verify email)
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng xuất
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      clearUser(); // Xóa khỏi Zustand Store
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Quên mật khẩu
  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
  };
};