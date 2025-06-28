import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Shield, UserPlus, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { RegistrationForm } from './RegistrationForm';
import { DeveloperDashboard } from './DeveloperDashboard';
import { useAuth } from './AuthProvider';
import { authService } from '../../services/authService';

const loginSchema = z.object({
  username: z.string().min(1, 'Email harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'developer'>('login');
  const [registrationStatus, setRegistrationStatus] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const watchedUsername = watch('username');

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setRegistrationStatus('');
    
    try {
      await login(data.username, data.password);
    } catch (error: any) {
      // Check if it's a registration status issue
      if (data.username.includes('@')) {
        const status = authService.checkRegistrationStatus(data.username);
        setRegistrationStatus(status.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkRegistrationStatus = () => {
    if (watchedUsername && watchedUsername.includes('@')) {
      const status = authService.checkRegistrationStatus(watchedUsername);
      setRegistrationStatus(status.message);
    }
  };

  if (currentView === 'register') {
    return <RegistrationForm onBack={() => setCurrentView('login')} />;
  }

  if (currentView === 'developer') {
    return <DeveloperDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Abimanyu Core Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Masuk ke akun Anda
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              {...register('username')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="admin@perusahaan.com"
              onBlur={checkRegistrationStatus}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.username.message}
              </p>
            )}
            {registrationStatus && (
              <p className={`mt-1 text-sm ${
                registrationStatus.includes('disetujui') ? 'text-green-600' :
                registrationStatus.includes('ditolak') ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {registrationStatus}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Ingat saya
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            icon={LogIn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Masuk..." />
            ) : (
              'Masuk'
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Belum punya akun?
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            icon={UserPlus}
            onClick={() => setCurrentView('register')}
          >
            Daftar Perusahaan Baru
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            icon={Settings}
            onClick={() => setCurrentView('developer')}
          >
            Developer Dashboard
          </Button>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Demo Credentials:
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
              <p><strong>Admin:</strong> admin@abimanyu.com | admin</p>
              <p><strong>Developer:</strong> developer | dev123456</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Developed by <strong>Abimanyu</strong> • v2.0.0
          </p>
        </div>
      </Card>
    </div>
  );
}