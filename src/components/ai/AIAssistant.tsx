import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User, Zap, TrendingUp, Calculator, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency } from '../../utils/calculations';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { PremiumGate } from '../premium/PremiumGate';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function AIAssistant() {
  const { hasFeature } = usePremiumStatus();
  const [workers] = useLocalStorage('workers', []);
  const [transactions] = useLocalStorage('transactions', []);
  const [payrollRecords] = useLocalStorage('payrollRecords', []);
  const [overtimeRecords] = useLocalStorage('overtimeRecords', []);
  const [projects] = useLocalStorage('projects', []);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Halo! Saya AI Assistant Abimanyu. Saya bisa membantu Anda menganalisis data proyek, gaji, kas, dan memberikan insight bisnis. Coba tanya saya tentang data Anda!',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!hasFeature('aiAssistant')) {
    return (
      <PremiumGate
        featureName="AI Assistant"
        description="Dapatkan insight cerdas dari data bisnis Anda dengan AI Assistant yang dapat menjawab pertanyaan tentang gaji, kas, proyek, dan memberikan analisis mendalam."
        onUpgrade={() => {}}
      />
    );
  }

  const processQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Gaji queries
    if (lowerQuery.includes('gaji') || lowerQuery.includes('payroll')) {
      const totalPayroll = payrollRecords.reduce((sum: number, p: any) => sum + p.totalPay, 0);
      const pendingPayroll = payrollRecords.filter((p: any) => p.status === 'pending').length;
      
      return `📊 **Ringkasan Gaji:**
      
• Total gaji yang sudah dibayar: ${formatCurrency(totalPayroll)}
• Gaji pending: ${pendingPayroll} catatan
• Rata-rata gaji per tukang: ${formatCurrency(totalPayroll / Math.max(workers.length, 1))}
• Tukang dengan gaji tertinggi: ${payrollRecords.length > 0 ? payrollRecords.sort((a: any, b: any) => b.totalPay - a.totalPay)[0]?.workerName : 'Belum ada data'}

💡 **Rekomendasi:** ${pendingPayroll > 0 ? 'Segera proses pembayaran gaji yang pending untuk menjaga kepuasan tukang.' : 'Semua gaji sudah dibayar. Pertahankan konsistensi pembayaran.'}`;
    }
    
    // Kas queries
    if (lowerQuery.includes('kas') || lowerQuery.includes('saldo') || lowerQuery.includes('keuangan')) {
      const income = transactions.filter((t: any) => t.type === 'income' && t.status === 'completed').reduce((sum: number, t: any) => sum + t.amount, 0);
      const expenses = transactions.filter((t: any) => t.type === 'expense' && t.status === 'completed').reduce((sum: number, t: any) => sum + t.amount, 0);
      const netCashFlow = income - expenses;
      
      return `💰 **Analisis Kas:**
      
• Total pemasukan: ${formatCurrency(income)}
• Total pengeluaran: ${formatCurrency(expenses)}
• Kas bersih: ${formatCurrency(netCashFlow)}
• Rasio pengeluaran: ${income > 0 ? Math.round((expenses / income) * 100) : 0}%

${netCashFlow > 0 ? '✅ **Status:** Kas sehat dengan surplus' : '⚠️ **Status:** Perhatian - kas defisit'}

💡 **Saran:** ${expenses / income > 0.8 ? 'Pengeluaran tinggi (>80%). Evaluasi biaya operasional dan cari peluang efisiensi.' : 'Kas flow baik. Pertimbangkan investasi untuk pertumbuhan bisnis.'}`;
    }
    
    // Lembur queries
    if (lowerQuery.includes('lembur') || lowerQuery.includes('overtime')) {
      const totalOvertimeHours = overtimeRecords.reduce((sum: number, o: any) => sum + o.hours, 0);
      const totalOvertimeAmount = overtimeRecords.reduce((sum: number, o: any) => sum + o.total, 0);
      
      return `⏰ **Analisis Lembur:**
      
• Total jam lembur: ${totalOvertimeHours} jam
• Total biaya lembur: ${formatCurrency(totalOvertimeAmount)}
• Rata-rata lembur per tukang: ${Math.round(totalOvertimeHours / Math.max(workers.length, 1))} jam
• Tukang dengan lembur terbanyak: ${overtimeRecords.length > 0 ? overtimeRecords.sort((a: any, b: any) => b.hours - a.hours)[0]?.workerName : 'Belum ada data'}

💡 **Insight:** ${totalOvertimeHours > workers.length * 10 ? 'Lembur tinggi. Pertimbangkan menambah tukang atau optimasi jadwal kerja.' : 'Lembur dalam batas wajar.'}`;
    }
    
    // Proyek queries
    if (lowerQuery.includes('proyek') || lowerQuery.includes('project')) {
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
      const totalBudget = projects.reduce((sum: number, p: any) => sum + p.budget, 0);
      const totalSpent = projects.reduce((sum: number, p: any) => sum + p.spent, 0);
      
      return `🏗️ **Status Proyek:**
      
• Proyek aktif: ${activeProjects}
• Proyek selesai: ${completedProjects}
• Total budget: ${formatCurrency(totalBudget)}
• Total terpakai: ${formatCurrency(totalSpent)}
• Utilisasi budget: ${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%

💡 **Rekomendasi:** ${totalSpent / totalBudget > 0.9 ? 'Budget hampir habis. Monitor pengeluaran proyek dengan ketat.' : 'Budget masih aman. Pastikan kualitas pekerjaan tetap terjaga.'}`;
    }
    
    // Tukang queries
    if (lowerQuery.includes('tukang') || lowerQuery.includes('worker') || lowerQuery.includes('pekerja')) {
      const activeWorkers = workers.filter((w: any) => w.isActive).length;
      const avgDailyRate = workers.reduce((sum: number, w: any) => sum + w.dailyRate, 0) / Math.max(workers.length, 1);
      
      return `👷 **Data Tukang:**
      
• Total tukang: ${workers.length}
• Tukang aktif: ${activeWorkers}
• Rata-rata tarif harian: ${formatCurrency(avgDailyRate)}
• Posisi terbanyak: ${workers.length > 0 ? workers.reduce((acc: any, w: any) => {
        acc[w.position] = (acc[w.position] || 0) + 1;
        return acc;
      }, {}) : 'Belum ada data'}

💡 **Insight:** ${activeWorkers < 5 ? 'Tim kecil. Pertimbangkan rekrutmen untuk ekspansi.' : 'Tim cukup besar. Fokus pada produktivitas dan retensi.'}`;
    }
    
    // Default response
    return `🤖 Maaf, saya belum bisa memahami pertanyaan tersebut. Coba tanya tentang:

• **Gaji** - "Bagaimana status gaji tukang?"
• **Kas** - "Berapa saldo kas saat ini?"
• **Lembur** - "Analisis jam lembur bulan ini"
• **Proyek** - "Status proyek yang sedang berjalan"
• **Tukang** - "Berapa jumlah tukang aktif?"

Atau tanya hal spesifik seperti "Siapa tukang dengan gaji tertinggi?" atau "Proyek mana yang paling boros budget?"`;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: processQuery(inputMessage),
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const quickQuestions = [
    'Bagaimana status gaji tukang?',
    'Berapa saldo kas saat ini?',
    'Analisis lembur bulan ini',
    'Status proyek aktif',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bot className="w-6 h-6 mr-2 text-blue-600" />
            AI Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tanya apa saja tentang data bisnis Anda
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            AI Powered
          </span>
        </div>
      </div>

      {/* Quick Questions */}
      <Card title="Pertanyaan Cepat">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              onClick={() => setInputMessage(question)}
              className="text-left justify-start"
            >
              {question}
            </Button>
          ))}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card>
        <div className="h-96 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tanya tentang gaji, kas, proyek, atau data lainnya..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            icon={Send}
          >
            Kirim
          </Button>
        </div>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Smart Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analisis otomatis performa bisnis
            </p>
          </div>
        </Card>
        
        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <Calculator className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Instant Calculations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hitung proyeksi dan estimasi cepat
            </p>
          </div>
        </Card>
        
        <Card className="hover:scale-105 transition-transform">
          <div className="text-center">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Report Generation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Buat laporan otomatis dari data
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}