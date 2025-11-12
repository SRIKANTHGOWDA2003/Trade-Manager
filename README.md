# 📊 Trade Manager Pro

A professional Next.js trade management application with shadcn/ui components, designed to help traders track, analyze, and improve their trading performance with advanced features and modern UI.

## ✨ Features

### 🔐 User Authentication
- **Secure Login/Signup**: User authentication with NextAuth.js
- **Personal Accounts**: Each user gets their own isolated trading data
- **Session Management**: Secure session handling with JWT tokens
- **Protected Routes**: Authentication guards for all application pages

### 📈 Advanced Trade Management
- **Complete Trade Entry**: Log all essential trade details including date, symbol, entry/exit prices, position size, and more
- **Trade Types**: Support for both Buy/Long and Sell/Short positions
- **Real-time P&L**: Automatic profit/loss and ROI calculations
- **Strategy Tracking**: Document your trading strategies and trade-specific notes
- **Trade Status**: Track open, closed, and cancelled trades

### 📊 Analytics & Dashboard
- **Performance Dashboard**: Comprehensive overview with key metrics
- **Interactive Charts**: Beautiful charts using Recharts library
- **Risk Metrics**: Sharpe ratio, profit factor, win rate analysis
- **Monthly Analysis**: Profit/loss breakdown by month
- **Symbol Distribution**: Track performance across different trading symbols

### 📅 Calendar View
- **Visual Trade Calendar**: Interactive calendar showing trade activity
- **Color-coded Days**: Visual indicators for profitable/losing days
- **Daily Trade Details**: Click any day to see detailed trade information
- **Monthly Statistics**: Quick stats for any selected month

### 🎨 Modern UI/UX
- **shadcn/ui Components**: Professional, accessible UI components
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Modern theme support with CSS variables
- **Smooth Animations**: Elegant transitions and interactions

### 💾 Database Integration
- **Prisma ORM**: Modern database toolkit with type safety
- **SQLite Database**: Lightweight, file-based database for easy setup
- **Data Relationships**: Proper relational data structure
- **Migration Support**: Easy database schema management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/trade-manager-pro.git
cd trade-manager-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npm run db:push
npm run db:generate
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 📋 Usage Guide

### 1. Create Account
- Visit `/auth/signup` to create a new account
- Fill in your name, email, and password
- After registration, sign in with your credentials

### 2. Add Trades
- Navigate to `/trades`
- Fill in the trade form with:
  - Symbol (e.g., AAPL, BTCUSDT)
  - Trade Type (Buy/Sell)
  - Entry Price and Quantity
  - Entry Date and Time
  - Optional: Strategy and Notes
- Click "Add Trade" to save

### 3. View Dashboard
- Visit `/dashboard` for comprehensive analytics
- View key metrics: Total P&L, Win Rate, Profit Factor, Sharpe Ratio
- Explore interactive charts showing performance over time

### 4. Calendar View
- Navigate to `/calendar` for visual trade tracking
- Click on any date to see trades for that day
- Color-coded indicators show profitable/losing days

## 🏗️ Project Structure

```
trade-manager-pro/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── trades/        # Trade CRUD operations
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Login page
│   │   └── signup/        # Registration page
│   ├── dashboard/         # Dashboard page
│   ├── trades/            # Trade management page
│   ├── calendar/          # Calendar view page
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── navigation.tsx    # Navigation component
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client setup
│   └── utils.ts         # Utility functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma    # Database schema definition
├── public/              # Static assets
├── package.json         # Project dependencies
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Lucide React**: Beautiful icons
- **Recharts**: Chart library for data visualization

### Backend & Database
- **NextAuth.js**: Authentication for Next.js
- **Prisma**: Modern database toolkit
- **SQLite**: Lightweight database
- **bcryptjs**: Password hashing
- **Zod**: Schema validation

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## 📊 Key Features Explained

### Authentication System
- **NextAuth.js Integration**: Secure authentication with multiple providers
- **Session Management**: JWT-based sessions with secure storage
- **Protected Routes**: Middleware to protect authenticated pages
- **User Data Isolation**: Each user can only access their own trades

### Database Schema
- **Users Table**: User account information
- **Trades Table**: Complete trade records with relationships
- **Type Safety**: Full TypeScript integration with Prisma

### Analytics Calculations
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Ratio of total profits to total losses
- **Sharpe Ratio**: Risk-adjusted return metric
- **ROI**: Return on investment calculations
- **Average Win/Loss**: Statistical analysis of trade performance

### Calendar Features
- **Trade Density**: Visual representation of trading frequency
- **Performance Indicators**: Color coding for profitable/losing days
- **Monthly Statistics**: Quick performance overview
- **Day-by-Day Breakdown**: Detailed trade information for any date

## 🔧 Customization

### Adding New Features
- **API Routes**: Add new endpoints in `app/api/`
- **Pages**: Create new pages in `app/`
- **Components**: Add reusable components in `components/`
- **Database**: Update schema in `prisma/schema.prisma`

### Styling
- **Theme**: Modify CSS variables in `app/globals.css`
- **Components**: Customize shadcn/ui components in `components/ui/`
- **Layout**: Update layout in `app/layout.tsx`

### Database Modifications
1. **Update Schema**: Edit `prisma/schema.prisma`
2. **Generate Client**: Run `npm run db:generate`
3. **Push Changes**: Run `npm run db:push`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handler

### Trades
- `GET /api/trades` - Get user's trades
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update existing trade
- `DELETE /api/trades/:id` - Delete trade

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect GitHub**: Link repository to Vercel
2. **Environment Variables**: Set up required environment variables
3. **Deploy**: Automatic deployment on push to main branch

### Other Platforms
- **Netlify**: Static site hosting
- **Railway**: Full-stack application hosting
- **DigitalOcean**: Cloud hosting with App Platform

### Production Setup
1. **Environment Variables**:
   ```env
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-production-secret
   DATABASE_URL=your-production-database-url
   ```

2. **Database Setup**:
   - Use PostgreSQL for production
   - Set up proper database connections
   - Run migrations: `npm run db:push`

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Session Security**: Secure JWT token handling
- **CSRF Protection**: Built-in NextAuth.js protection
- **Data Validation**: Zod schema validation for API inputs
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection

## 🧪 Development

### Running Tests
```bash
npm run test        # Run test suite
npm run test:watch  # Watch mode
npm run lint        # Code linting
```

### Database Management
```bash
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
```

### Building for Production
```bash
npm run build        # Build production application
npm run start        # Start production server
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use proper error handling
- Write clean, commented code
- Test new features thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: Report bugs or request features on GitHub Issues
- **Discussions**: Ask questions and share experiences
- **Documentation**: Check this README for detailed instructions

## 🌟 Roadmap

- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: More sophisticated risk metrics
- [ ] **Portfolio Management**: Multiple portfolio support
- [ ] **Broker Integration**: Connect to brokerage APIs
- [ ] **Real-time Data**: Live market data integration
- [ ] **Backtesting**: Strategy backtesting tools
- [ ] **Social Features**: Share strategies with community
- [ ] **Export Features**: PDF reports, Excel exports

---

## 🎉 Start Trading Better Today!

Transform your trading with professional analytics and insights. Trade Manager Pro provides everything you need to track, analyze, and improve your trading performance.

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**

---

**⚠️ Disclaimer**: This tool is for educational and tracking purposes only. Always do your own research before making trading decisions.