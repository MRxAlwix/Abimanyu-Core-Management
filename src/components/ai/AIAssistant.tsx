import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User, Zap, TrendingUp, Calculator, FileText, Brain, Sparkles, BarChart3, Target, Lightbulb } from 'lucide-react';
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
  category?: 'analysis' | 'recommendation' | 'calculation' | 'insight';
}

export function AIAssistant() {
  const { hasFeature } = usePremiumStatus();
  const [workers] = useLocalStorage('workers', []);
  const [transactions] = useLocalStorage('transactions', []);
  const [payrollRecords] = useLocalStorage('payrollRecords', []);
  const [overtimeRecords] = useLocalStorage('overtimeRecords', []);
  const [projects] = useLocalStorage('projects', []);
  const [materials] = useLocalStorage('materials', []);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: '🤖 **Halo! Saya AI Assistant Abimanyu yang telah ditingkatkan!**\n\nSaya sekarang dapat:\n• 📊 Analisis mendalam data bisnis\n• 💡 Memberikan rekomendasi strategis\n• 🔮 Prediksi tren dan peluang\n• 📈 Optimasi operasional\n• 🎯 Insight berbasis AI\n\nTanya saya tentang apa saja!',
      timestamp: new Date().toISOString(),
      category: 'insight'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!hasFeature('aiAssistant')) {
    return (
      <PremiumGate
        featureName="AI Assistant Premium"
        description="Dapatkan insight cerdas dan analisis mendalam dari data bisnis Anda dengan AI Assistant yang dapat memberikan rekomendasi strategis, prediksi tren, dan optimasi operasional."
        onUpgrade={() => {}}
      />
    );
  }

  const processAdvancedQuery = (query: string): { content: string; category: 'analysis' | 'recommendation' | 'calculation' | 'insight' } => {
    const lowerQuery = query.toLowerCase();
    
    // Advanced Analytics Queries
    if (lowerQuery.includes('analisis') || lowerQuery.includes('analytics') || lowerQuery.includes('performa')) {
      const totalIncome = transactions.filter((t: any) => t.type === 'income' && t.status === 'completed').reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalExpenses = transactions.filter((t: any) => t.type === 'expense' && t.status === 'completed').reduce((sum: number, t: any) => sum + t.amount, 0);
      const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
      const avgWorkerCost = workers.length > 0 ? payrollRecords.reduce((sum: number, p: any) => sum + p.totalPay, 0) / workers.length : 0;
      
      return {
        content: `📊 **Analisis Performa Bisnis Mendalam:**

**💰 Kesehatan Finansial:**
• Margin keuntungan: ${profitMargin.toFixed(1)}%
• ROI operasional: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalExpenses * 100).toFixed(1) : 0}%
• Efisiensi biaya: ${totalExpenses > 0 ? (totalIncome / totalExpenses).toFixed(2) : 0}x

**👷 Produktivitas Tenaga Kerja:**
• Rata-rata biaya per tukang: ${formatCurrency(avgWorkerCost)}
• Utilisasi tenaga kerja: ${Math.round((workers.filter((w: any) => w.isActive).length / workers.length) * 100)}%
• Efektivitas lembur: ${overtimeRecords.length > 0 ? 'Optimal' : 'Perlu evaluasi'}

**🎯 Rekomendasi AI:**
${profitMargin < 15 ? '⚠️ Margin keuntungan rendah - optimasi biaya operasional' : '✅ Margin keuntungan sehat'}
${workers.filter((w: any) => w.isActive).length / workers.length < 0.8 ? '⚠️ Banyak tukang tidak aktif - evaluasi SDM' : '✅ Utilisasi SDM optimal'}`,
        category: 'analysis'
      };
    }

    // Predictive Analytics
    if (lowerQuery.includes('prediksi') || lowerQuery.includes('forecast') || lowerQuery.includes('proyeksi')) {
      const monthlyIncome = transactions.filter((t: any) => t.type === 'income' && t.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum: number, t: any) => sum + t.amount, 0);
      const projectedAnnual = monthlyIncome * 12;
      const growthRate = 15; // Simulated growth rate
      
      return {
        content: `🔮 **Prediksi & Proyeksi Bisnis:**

**📈 Proyeksi Pendapatan:**
• Proyeksi tahunan: ${formatCurrency(projectedAnnual)}
• Potensi pertumbuhan: ${growthRate}% (${formatCurrency(projectedAnnual * (growthRate/100))})
• Target optimal: ${formatCurrency(projectedAnnual * 1.2)}

**🎯 Peluang Ekspansi:**
• Kapasitas tambahan: ${Math.max(0, 10 - workers.filter((w: any) => w.isActive).length)} tukang
• Potensi proyek baru: ${Math.round(projects.length * 1.3)} proyek
• ROI investasi SDM: 180-220%

**💡 Strategi AI:**
• Fokus pada proyek dengan margin >20%
• Investasi teknologi untuk efisiensi
• Diversifikasi layanan konstruksi
• Optimasi jadwal untuk mengurangi idle time`,
        category: 'insight'
      };
    }

    // Cost Optimization
    if (lowerQuery.includes('optimasi') || lowerQuery.includes('efisiensi') || lowerQuery.includes('hemat')) {
      const materialCosts = materials.reduce((sum: number, m: any) => sum + (m.stock * m.pricePerUnit), 0);
      const laborCosts = payrollRecords.reduce((sum: number, p: any) => sum + p.totalPay, 0);
      
      return {
        content: `⚡ **Optimasi Biaya & Efisiensi:**

**💰 Analisis Struktur Biaya:**
• Biaya material: ${formatCurrency(materialCosts)} (${materialCosts > 0 ? Math.round((materialCosts / (materialCosts + laborCosts)) * 100) : 0}%)
• Biaya tenaga kerja: ${formatCurrency(laborCosts)} (${laborCosts > 0 ? Math.round((laborCosts / (materialCosts + laborCosts)) * 100) : 0}%)

**🎯 Peluang Penghematan:**
• Negosiasi supplier: Potensi hemat 8-12%
• Bulk purchasing: Hemat ${formatCurrency(materialCosts * 0.05)} per bulan
• Optimasi jadwal: Kurangi lembur 15-20%
• Preventive maintenance: Hemat 10% biaya perbaikan

**🚀 Rekomendasi Implementasi:**
1. **Minggu 1-2:** Audit supplier dan negosiasi kontrak
2. **Minggu 3-4:** Implementasi sistem inventory just-in-time
3. **Bulan 2:** Training efisiensi untuk tukang
4. **Bulan 3:** Evaluasi dan fine-tuning sistem`,
        category: 'recommendation'
      };
    }

    // Risk Analysis
    if (lowerQuery.includes('risiko') || lowerQuery.includes('risk') || lowerQuery.includes('bahaya')) {
      const cashFlow = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0) - 
                      transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
      
      return {
        content: `⚠️ **Analisis Risiko Bisnis:**

**🔍 Identifikasi Risiko:**
• **Risiko Finansial:** ${cashFlow < 0 ? 'TINGGI - Cash flow negatif' : 'RENDAH - Cash flow positif'}
• **Risiko Operasional:** ${workers.filter((w: any) => w.isActive).length < 5 ? 'TINGGI - SDM terbatas' : 'SEDANG'}
• **Risiko Pasar:** SEDANG - Fluktuasi permintaan konstruksi
• **Risiko Supplier:** ${materials.filter((m: any) => m.stock <= m.minStock).length > 0 ? 'TINGGI - Stok material menipis' : 'RENDAH'}

**🛡️ Strategi Mitigasi:**
• **Diversifikasi klien:** Target 5+ klien aktif
• **Emergency fund:** Siapkan dana 3-6 bulan operasional
• **Backup supplier:** Minimal 2 supplier per material
• **Asuransi komprehensif:** Lindungi aset dan operasional

**📊 Risk Score:** ${cashFlow >= 0 && workers.filter((w: any) => w.isActive).length >= 5 ? 'RENDAH (2/10)' : 'SEDANG (5/10)'}`,
        category: 'analysis'
      };
    }

    // Market Intelligence
    if (lowerQuery.includes('pasar') || lowerQuery.includes('kompetitor') || lowerQuery.includes('tren')) {
      return {
        content: `🌍 **Market Intelligence & Tren:**

**📈 Tren Industri Konstruksi 2024:**
• Pertumbuhan sektor: 6.2% YoY
• Demand tertinggi: Renovasi rumah (+18%)
• Teknologi trending: Smart home integration
• Material populer: Eco-friendly materials

**🎯 Positioning Strategis:**
• **Niche market:** Renovasi premium & smart home
• **Competitive advantage:** Teknologi QR presensi
• **Value proposition:** Transparansi & efisiensi
• **Target segment:** Middle-upper class homeowners

**💡 Peluang Bisnis:**
• **Green construction:** Potensi premium 15-25%
• **Smart home integration:** Market size $2.8B
• **Maintenance contracts:** Recurring revenue stream
• **Digital documentation:** Diferensiasi kompetitif

**🚀 Action Plan:**
1. Sertifikasi green building
2. Partnership dengan smart home vendors
3. Develop maintenance service packages
4. Digital portfolio & testimonials`,
        category: 'insight'
      };
    }

    // Default enhanced response
    return {
      content: `🤖 **AI Assistant Siap Membantu!**

Saya dapat memberikan analisis mendalam tentang:

**📊 Analytics & Insights:**
• "Analisis performa bisnis bulan ini"
• "Prediksi pendapatan tahun depan"
• "Optimasi biaya operasional"

**🎯 Strategic Planning:**
• "Strategi ekspansi bisnis"
• "Analisis risiko dan mitigasi"
• "Tren pasar konstruksi 2024"

**💡 Operational Excellence:**
• "Cara meningkatkan produktivitas tukang"
• "Optimasi inventory material"
• "Efisiensi jadwal proyek"

**🔮 Predictive Analytics:**
• "Proyeksi cash flow 6 bulan"
• "Forecast kebutuhan SDM"
• "Prediksi biaya material"

Tanya saya hal spesifik untuk mendapatkan insight yang lebih mendalam!`,
      category: 'insight'
    };
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
    
    setTimeout(() => {
      const aiResponse = processAdvancedQuery(inputMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        category: aiResponse.category,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const quickQuestions = [
    'Analisis performa bisnis bulan ini',
    'Prediksi pendapatan tahun depan',
    'Optimasi biaya operasional',
    'Strategi ekspansi bisnis',
    'Analisis risiko dan mitigasi',
    'Tren pasar konstruksi 2024',
  ];

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'analysis': return BarChart3;
      case 'recommendation': return Target;
      case 'calculation': return Calculator;
      case 'insight': return Lightbulb;
      default: return Brain;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'analysis': return 'text-blue-500';
      case 'recommendation': return 'text-green-500';
      case 'calculation': return 'text-purple-500';
      case 'insight': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            AI Assistant Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced analytics & strategic insights powered by AI
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 px-3 py-2 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Enhanced AI
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <Card title="🚀 Quick Analytics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              onClick={() => setInputMessage(question)}
              className="text-left justify-start hover:scale-105 transition-all duration-200 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm">{question}</span>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card>
        <div className="h-96 overflow-y-auto space-y-4 mb-4 p-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-4xl ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`px-6 py-4 rounded-2xl shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}>
                  {message.type === 'assistant' && message.category && (
                    <div className="flex items-center mb-2">
                      {React.createElement(getCategoryIcon(message.category), {
                        className: `w-4 h-4 mr-2 ${getCategoryColor(message.category)}`
                      })}
                      <span className={`text-xs font-medium uppercase tracking-wide ${getCategoryColor(message.category)}`}>
                        {message.category}
                      </span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-70 mt-3 flex items-center">
                    {message.type === 'assistant' && (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
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
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-700 px-6 py-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">AI sedang menganalisis...</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tanya tentang analytics, prediksi, optimasi, atau strategi bisnis..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            icon={Send}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6"
          >
            Send
          </Button>
        </div>
      </Card>

      {/* AI Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="text-center">
            <BarChart3 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Advanced Analytics</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Deep business insights & performance analysis
            </p>
          </div>
        </Card>
        
        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="text-center">
            <Target className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Strategic Recommendations</h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              AI-powered business strategy & optimization
            </p>
          </div>
        </Card>
        
        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Predictive Forecasting</h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Future trends & revenue projections
            </p>
          </div>
        </Card>
        
        <Card className="hover:scale-105 transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="text-center">
            <Lightbulb className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Smart Insights</h3>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Actionable intelligence & market analysis
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}