# Abimanyu Core Management System

🚀 **AI-Powered Construction Management System** - Sistem manajemen tukang dan keuangan yang komprehensif untuk bisnis konstruksi.

## 🌟 Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Admin, Developer, Manager
- **Secure Registration System**: Email verification dan approval workflow
- **Password Protection**: Encrypted password storage
- **Session Management**: Secure token-based authentication

### 👷 Worker Management
- **Complete Worker Profiles**: Data lengkap tukang dengan foto dan keahlian
- **Active/Inactive Status**: Kelola status aktif tukang
- **Archive System**: Arsipkan data tukang yang tidak aktif
- **Skills Tracking**: Lacak keahlian dan spesialisasi

### 💰 Payroll System
- **Automated Calculations**: Hitung gaji otomatis berdasarkan hari kerja
- **Overtime Integration**: Integrasi dengan sistem lembur (1.5x rate)
- **Multiple Payment Status**: Pending, Paid, Cancelled
- **Historical Records**: Riwayat pembayaran gaji lengkap

### 💸 Cash Flow Management
- **Income/Expense Tracking**: Lacak pemasukan dan pengeluaran
- **Category Management**: Kategorisasi transaksi
- **Real-time Balance**: Saldo kas real-time
- **Financial Reports**: Laporan keuangan otomatis

### ⏰ Overtime Management
- **Flexible Hour Tracking**: Catat jam lembur dengan presisi
- **Rate Calculation**: Kalkulasi tarif lembur otomatis
- **Project Integration**: Hubungkan lembur dengan proyek
- **Approval Workflow**: Sistem persetujuan lembur

### 💳 Kasbon (Advance Payment) System
- **Employee Advances**: Sistem kasbon untuk tukang
- **Auto Deduction**: Pemotongan otomatis dari gaji
- **Approval Process**: Workflow persetujuan kasbon
- **Payment Tracking**: Lacak status pembayaran kasbon

### 🏗️ Project Management
- **Project Lifecycle**: Kelola proyek dari planning hingga completion
- **Budget Tracking**: Monitor budget vs actual spending
- **Progress Monitoring**: Lacak progress proyek real-time
- **QR Code Integration**: Generate QR code untuk setiap proyek

### 📦 Material Management
- **Inventory Tracking**: Kelola stok material
- **Price Management**: Lacak harga material per supplier
- **Low Stock Alerts**: Notifikasi stok menipis
- **Cost Calculator**: Kalkulator biaya material untuk proyek

### 📱 QR Code Attendance
- **QR Code Generation**: Generate QR code untuk presensi
- **Mobile Scanning**: Scan QR code untuk check-in/out
- **Location Tracking**: Lacak lokasi presensi
- **Offline Support**: Mode offline dengan sinkronisasi

### 📊 RAB (Budget Estimation) Calculator
- **Automated RAB**: Buat RAB otomatis untuk proyek
- **Material Integration**: Integrasi dengan database material
- **Overhead & Profit**: Kalkulasi overhead dan profit margin
- **Export Functionality**: Export RAB ke CSV/Excel

### 📈 Gantt Chart & Timeline
- **Project Timeline**: Visualisasi timeline proyek
- **Task Dependencies**: Kelola dependensi antar task
- **Progress Tracking**: Monitor progress setiap task
- **Resource Allocation**: Alokasi sumber daya

### 🤖 AI Assistant Premium
- **Business Analytics**: Analisis mendalam data bisnis
- **Predictive Insights**: Prediksi tren dan peluang
- **Strategic Recommendations**: Rekomendasi strategis berbasis AI
- **Cost Optimization**: Saran optimasi biaya operasional
- **Risk Analysis**: Analisis risiko bisnis
- **Market Intelligence**: Insight pasar dan kompetitor

### 📋 Weekly Reports
- **Automated Reports**: Laporan mingguan otomatis
- **Productivity Analysis**: Analisis produktivitas tukang
- **Financial Summary**: Ringkasan keuangan mingguan
- **Export Options**: Export laporan ke berbagai format

### 🎨 Premium Features
- **Unlimited Actions**: Tidak ada batasan aksi bulanan
- **Advanced Analytics**: Analytics mendalam dan prediksi
- **Cloud Backup**: Backup otomatis ke cloud
- **Priority Support**: Dukungan prioritas 24/7
- **Custom Themes**: Tema eksklusif dan kustomisasi
- **AI Assistant**: Asisten AI untuk insight bisnis

### ⚙️ System Features
- **Dark/Light Theme**: Mode tema gelap dan terang
- **Responsive Design**: Optimal di semua perangkat
- **Real-time Notifications**: Notifikasi real-time
- **Data Export**: Export data ke CSV/Excel
- **Backup & Restore**: Sistem backup dan restore
- **Multi-language**: Dukungan multi bahasa
- **Sound Effects**: Efek suara untuk feedback
- **Offline Mode**: Mode offline dengan sinkronisasi

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Hot Toast** - Notifications

### State Management
- **Local Storage** - Client-side data persistence
- **Context API** - Global state management
- **Custom Hooks** - Reusable state logic

### Security
- **CryptoJS** - Data encryption
- **JWT-like Tokens** - Secure authentication
- **Input Validation** - Comprehensive validation
- **XSS Protection** - Cross-site scripting protection

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/abimanyu-core-management.git
   cd abimanyu-core-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Demo Accounts

#### Admin Account
- **Email**: `admin@abimanyu.com`
- **Password**: `admin123`
- **Features**: Full access to all features

#### Developer Account
- **Email**: `developer@abimanyu.com`
- **Password**: `dev123456`
- **Features**: Developer dashboard + all admin features

### Registration Process

1. **Register New Company**
   - Fill registration form with company details
   - Create password for login
   - Wait for developer approval

2. **Developer Approval**
   - Login as developer
   - Review registration requests
   - Approve or reject with reason

3. **Login with Approved Account**
   - Use registered email and password
   - Access full system features

## 📱 Usage Guide

### 1. Worker Management
- Add new workers with complete profiles
- Set daily rates and positions
- Manage active/inactive status
- Track skills and specializations

### 2. Payroll Processing
- Calculate monthly payroll automatically
- Include overtime hours
- Process payments and track status
- Generate payroll reports

### 3. Cash Flow Tracking
- Record income and expenses
- Categorize transactions
- Monitor cash flow balance
- Export financial data

### 4. Project Management
- Create and manage projects
- Set budgets and track spending
- Monitor project progress
- Generate project QR codes

### 5. Attendance System
- Generate QR codes for locations
- Workers scan for check-in/out
- Track attendance and location
- Handle offline scenarios

### 6. AI Assistant
- Ask business questions
- Get analytics insights
- Receive strategic recommendations
- Analyze performance data

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_NAME=Abimanyu Core Management
VITE_APP_VERSION=2.1.0
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Theme Configuration
The system supports light and dark themes with automatic detection of system preferences.

### Sound Settings
Sound effects can be enabled/disabled in the settings page.

## 📊 Data Structure

### Local Storage Keys
- `abimanyu_auth` - Authentication data
- `abimanyu_users` - User accounts
- `abimanyu_registrations` - Registration requests
- `workers` - Worker data
- `transactions` - Financial transactions
- `payrollRecords` - Payroll history
- `overtimeRecords` - Overtime records
- `projects` - Project data
- `materials` - Material inventory
- `attendance` - Attendance records

### Data Validation
All data inputs are validated using Zod schemas for type safety and data integrity.

## 🔒 Security Features

### Authentication
- Encrypted password storage
- Secure token generation
- Session management
- Role-based access control

### Data Protection
- Input sanitization
- XSS protection
- CSRF protection
- Secure local storage

### Privacy
- No external data transmission
- Local data storage only
- User consent for data processing

## 🎨 UI/UX Features

### Design System
- Consistent color palette
- Typography hierarchy
- Spacing system (8px grid)
- Component library

### Animations
- Smooth transitions
- Hover effects
- Loading states
- Micro-interactions

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

## 📈 Performance

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

### Caching
- Local storage caching
- Component memoization
- Efficient re-renders

## 🧪 Testing

### Test Coverage
- Unit tests for utilities
- Component testing
- Integration tests
- E2E testing scenarios

### Quality Assurance
- TypeScript type checking
- ESLint code quality
- Performance monitoring
- Error boundary handling

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- Netlify (recommended)
- Vercel
- GitHub Pages
- Self-hosted

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Write comprehensive tests
4. Document new features
5. Follow Git commit conventions

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Troubleshooting](docs/troubleshooting.md)

### Contact
- **Email**: support@abimanyu.com
- **Website**: https://abimanyu.com
- **GitHub**: https://github.com/abimanyu-dev

## 🎯 Roadmap

### Version 2.2.0
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced reporting
- [ ] API integrations

### Version 2.3.0
- [ ] Multi-company support
- [ ] Advanced AI features
- [ ] Custom workflows
- [ ] Third-party integrations

## 🏆 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library
- **Vite** - For the fast build tool
- **TypeScript** - For type safety

---

**Made with ❤️ by Abimanyu Team**

*Empowering construction businesses with intelligent management solutions.*