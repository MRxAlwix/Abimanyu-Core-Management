# Abimanyu Core Management System

🚀 **Production-Ready Construction Management System** - Sistem manajemen tukang dan keuangan yang komprehensif untuk bisnis konstruksi dengan database real-time dan integrasi pembayaran.

## 🌟 Features

### 🔐 Authentication & Security
- **Real Database Integration**: Supabase PostgreSQL dengan Row Level Security
- **Secure Registration**: Email verification dan password encryption
- **JWT Authentication**: Token-based authentication dengan refresh
- **Multi-platform Support**: Web, Desktop (Electron), Mobile (Capacitor)

### 👷 Worker Management
- **Database-Backed Profiles**: Data tukang tersimpan aman di cloud
- **Real-time Sync**: Sinkronisasi data real-time antar device
- **Skills Tracking**: Lacak keahlian dan spesialisasi
- **Performance Analytics**: Analisis produktivitas tukang

### 💰 Financial Management
- **Automated Payroll**: Hitung gaji otomatis dengan database
- **Real-time Cash Flow**: Monitor kas masuk/keluar real-time
- **Premium Payments**: Integrasi Midtrans untuk pembayaran premium
- **Financial Reports**: Laporan keuangan otomatis dan export

### 🏗️ Project Management
- **Cloud-Based Projects**: Proyek tersimpan aman di database
- **QR Code Integration**: Generate QR code untuk presensi
- **Progress Tracking**: Monitor progress real-time
- **Budget Management**: Kelola budget vs actual spending

### 📱 Multi-Platform Support
- **Web Application**: Responsive web app
- **Desktop App**: Electron-based desktop application
- **Mobile App**: Capacitor-based mobile app (Android/iOS)
- **PWA Support**: Progressive Web App capabilities

### 💳 Premium Features
- **Midtrans Integration**: Pembayaran QRIS, E-wallet, Transfer Bank
- **Unlimited Actions**: Tidak ada batasan aksi bulanan
- **Advanced Analytics**: AI-powered business insights
- **Cloud Backup**: Backup otomatis ke Supabase
- **Priority Support**: Dukungan prioritas 24/7

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

### Backend & Database
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Database-level security
- **Real-time Subscriptions** - Live data updates
- **Edge Functions** - Serverless functions

### Authentication
- **Supabase Auth** - Built-in authentication
- **JWT Tokens** - Secure token-based auth
- **Password Encryption** - bcrypt hashing
- **Email Verification** - Secure registration flow

### Payments
- **Midtrans** - Indonesian payment gateway
- **QRIS** - QR code payments
- **E-wallets** - GoPay, OVO, DANA, LinkAja
- **Bank Transfer** - All major Indonesian banks

### Multi-Platform
- **Electron** - Desktop applications
- **Capacitor** - Mobile applications
- **PWA** - Progressive Web App

### Security
- **Row Level Security** - Database-level access control
- **HTTPS Everywhere** - Secure connections
- **Input Validation** - Comprehensive validation
- **XSS Protection** - Cross-site scripting protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Midtrans account (for payments)

### 1. Clone Repository
```bash
git clone https://github.com/abimanyu-dev/core-management.git
cd core-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Midtrans Payment Gateway
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
VITE_MIDTRANS_SERVER_KEY=your_midtrans_server_key
VITE_MIDTRANS_IS_PRODUCTION=false

# JWT Secret
VITE_JWT_SECRET=your_jwt_secret_key
```

### 4. Database Setup
Run the migration in your Supabase dashboard:
```sql
-- Copy and run the SQL from supabase/migrations/001_initial_schema.sql
```

### 5. Start Development
```bash
npm run dev
```

## 📱 Multi-Platform Builds

### Desktop Application (Electron)
```bash
npm run build:electron
```

### Android Application
```bash
npm run build:android
```

### iOS Application
```bash
npm run build:ios
```

## 🌐 Deployment

### Netlify
```bash
# Automatic deployment with netlify.toml configuration
git push origin main
```

### Vercel
```bash
# Automatic deployment with vercel.json configuration
git push origin main
```

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the migration SQL in the SQL editor
3. Configure Row Level Security policies
4. Get your project URL and anon key

### Midtrans Setup
1. Create Midtrans account
2. Get client key and server key
3. Configure webhook endpoints
4. Test in sandbox mode first

### Environment Variables
All environment variables are documented in `.env.example`

## 📊 Database Schema

### Core Tables
- `users` - User accounts and company information
- `workers` - Worker/employee data
- `transactions` - Financial transactions
- `payroll_records` - Payroll calculations
- `projects` - Project management
- `materials` - Material inventory
- `attendance_records` - Worker attendance
- `overtime_records` - Overtime tracking
- `premium_subscriptions` - Premium subscriptions

### Security
- Row Level Security enabled on all tables
- Policies restrict access to user's own data
- Encrypted passwords and secure tokens

## 🔒 Security Features

### Database Security
- Row Level Security (RLS)
- Encrypted connections (SSL)
- Input validation and sanitization
- SQL injection prevention

### Application Security
- JWT token authentication
- Password encryption (bcrypt)
- XSS protection
- CSRF protection
- Secure headers

### Data Protection
- Real-time backup to Supabase
- Data encryption at rest
- Secure API endpoints
- Privacy compliance

## 🎨 Design System

### Colors
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font: Inter (system fallback)
- Headings: 120% line height
- Body: 150% line height
- Max 3 font weights

### Spacing
- 8px grid system
- Consistent margins and padding
- Responsive breakpoints

## 📈 Performance

### Optimization
- Code splitting with Vite
- Lazy loading components
- Image optimization
- Bundle size optimization

### Caching
- Database query caching
- Local storage caching
- Service worker caching (PWA)

### Monitoring
- Error boundary handling
- Performance metrics
- User analytics

## 🧪 Testing

### Test Coverage
```bash
npm run test
npm run test:coverage
npm run test:ui
```

### Quality Assurance
- TypeScript type checking
- ESLint code quality
- Automated testing
- Manual QA testing

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
- [Deployment Guide](docs/deployment.md)

### Contact
- **Email**: support@abimanyu.com
- **Website**: https://abimanyu.com
- **GitHub**: https://github.com/abimanyu-dev

## 🎯 Roadmap

### Version 2.3.0
- [ ] Real-time collaboration
- [ ] Advanced AI analytics
- [ ] Multi-company support
- [ ] API integrations

### Version 2.4.0
- [ ] Inventory management
- [ ] Equipment tracking
- [ ] Advanced reporting
- [ ] Custom workflows

## 🏆 Acknowledgments

- **Supabase** - For the amazing backend-as-a-service
- **Midtrans** - For secure payment processing
- **React Team** - For the React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vite** - For the fast build tool

---

**Made with ❤️ by Abimanyu Team**

*Empowering construction businesses with intelligent, secure, and scalable management solutions.*

## 🔐 Security Notice

This application implements enterprise-grade security measures:
- All data is encrypted in transit and at rest
- Database access is protected by Row Level Security
- Authentication uses industry-standard JWT tokens
- Payment processing is PCI DSS compliant through Midtrans
- Regular security audits and updates

For security concerns, please contact: security@abimanyu.com