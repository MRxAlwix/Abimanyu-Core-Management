import React, { useState } from 'react';
import { Crown, Check, CreditCard, X, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'yearly') => Promise<void>;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

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

  const premiumFeatures = [
    'Export Excel desain profesional',
    'Statistik visual dan detail mingguan',
    'Auto backup ke cloud',
    'Proyek tak terbatas',
    'Tema eksklusif + UI personal',
    'Upload file besar & banyak',
    'Reminder otomatis + sinkronisasi kalender',
    'Priority Support 24/7',
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await onUpgrade(selectedPlan);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upgrade ke Premium
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plans */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Pilih Paket
              </h4>
              
              {plans.map((plan) => (
                <div
                  key={plan.type}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPlan === plan.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => setSelectedPlan(plan.type)}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-4">
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        POPULER
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.description}
                      </p>
                      {plan.savings && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                          {plan.savings}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(plan.price)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.period}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Fitur Premium
              </h4>
              
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg mt-6">
                <div className="flex items-center mb-2">
                  <Crown className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    Trial 7 Hari Gratis
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Coba semua fitur premium selama 7 hari tanpa biaya
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="secondary"
              onClick={onClose}
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
              {isProcessing ? (
                <LoadingSpinner size="sm" text="Memproses..." />
              ) : (
                `Bayar ${formatCurrency(plans.find(p => p.type === selectedPlan)?.price || 0)}`
              )}
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
            Pembayaran aman dengan Midtrans • QRIS, E-wallet, Transfer Bank, Kartu Kredit
          </div>
        </div>
      </div>
    </div>
  );
}