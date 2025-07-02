import React, { useState } from 'react';
import { Crown, Star, Check, CreditCard, Zap, Shield, Cloud, Palette } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuth } from '../auth/AuthProvider';
import { paymentService } from '../../services/paymentService';
import { notificationService } from '../../services/notificationService';

export function PremiumFeatures() {
  const { user } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const premiumFeatures = [
    {
      icon: Cloud,
      title: 'Backup Otomatis ke Cloud',
      description: 'Backup otomatis ke Supabase setiap hari',
      free: false,
    },
    {
      icon: Star,
      title: 'Statistik Lanjutan',
      description: 'Analytics mendalam dan prediksi bisnis',
      free: false,
    },
    {
      icon: Palette,
      title: 'Tema Eksklusif',
      description: '10+ tema premium dan kustomisasi warna',
      free: false,
    },
    {
      icon: Zap,
      title: 'Export Custom Excel',
      description: 'Template Excel dengan branding dan logo',
      free: false,
    },
    {
      icon: Shield,
      title: 'Keamanan Tingkat Tinggi',
      description: '2FA dan enkripsi end-to-end',
      free: false,
    },
    {
      icon: Crown,
      title: 'Priority Support',
      description: 'Dukungan prioritas 24/7',
      free: false,
    },
  ];

  const plans = [
    {
      type: 'monthly' as const,
      name: 'Premium Bulanan',
      price: 29000,
      period: '/bulan',
      description: 'Akses penuh fitur premium',
      popular: false,
    },
    {
      type: 'yearly' as const,
      name: 'Premium Tahunan',
      price: 299000,
      period: '/tahun',
      description: 'Hemat 2 bulan! Akses penuh fitur premium',
      popular: true,
      savings: 'Hemat Rp 49.000',
    },
  ];

  const handleUpgrade = async () => {
    if (!user) {
      notificationService.error('Silakan login terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentData = await paymentService.createPayment({
        userId: user.id,
        subscriptionType: selectedPlan,
        customerDetails: {
          firstName: user.ownerName.split(' ')[0] || user.username,
          lastName: user.ownerName.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: user.phone || '',
        },
      });

      // Open Midtrans payment modal
      await paymentService.openPaymentModal(paymentData.token);
      
      setIsUpgradeModalOpen(false);
    } catch (error: any) {
      notificationService.error(error.message || 'Gagal membuat pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Crown className="w-6 h-6 text-yellow-500 mr-2" />
            Fitur Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tingkatkan pengalaman dengan fitur eksklusif
          </p>
        </div>
        <Button
          icon={Crown}
          onClick={() => setIsUpgradeModalOpen(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          Upgrade Premium
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="hover:scale-105 transition-transform">
            <div className="text-center space-y-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full mx-auto w-fit">
                <feature.icon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <Crown className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Premium</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade ke Premium"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Pilih Paket Premium
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Dapatkan akses penuh ke semua fitur eksklusif
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPlan === plan.type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={() => setSelectedPlan(plan.type)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      POPULER
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h4>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                  {plan.savings && (
                    <div className="mb-4">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Yang Anda Dapatkan:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsUpgradeModalOpen(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              icon={CreditCard}
            >
              {isProcessing ? 'Memproses...' : `Bayar ${formatCurrency(plans.find(p => p.type === selectedPlan)?.price || 0)}`}
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Pembayaran aman dengan Midtrans • QRIS, E-wallet, Transfer Bank
          </div>
        </div>
      </Modal>
    </div>
  );
}