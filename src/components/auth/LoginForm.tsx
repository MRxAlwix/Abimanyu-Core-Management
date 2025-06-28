import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Shield, UserPlus, Settings, Sparkles, Lock, CheckCircle, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 px-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Abimanyu Core
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Sistem Manajemen Tukang & Keuangan
          </p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              AI-Powered Management System
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('username')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 pl-12"
                  placeholder="admin@perusahaan.com"
                  onBlur={checkRegistrationStatus}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  {errors.username.message}
                </p>
              )}
              {registrationStatus && (
                <div className={`mt-2 p-3 rounded-lg flex items-center ${
                  registrationStatus.includes('disetujui') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                  registrationStatus.includes('ditolak') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                  'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                }`}>
                  {registrationStatus.includes('disetujui') ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm font-medium">{registrationStatus}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" text="Signing in..." />
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                Don't have an account?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
              icon={UserPlus}
              onClick={() => setCurrentView('register')}
            >
              Register New Company
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              icon={Settings}
              onClick={() => setCurrentView('developer')}
            >
              Developer Dashboard
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-2">
              🚀 Demo Credentials
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Admin:</span>
                <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">admin@abimanyu.com | admin123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Developer:</span>
                <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">developer | dev123456</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by <strong className="text-blue-600 dark:text-blue-400">Abimanyu AI</strong> • v2.1.0
          </p>
        </div>
      </Card>
    </div>
  );
}