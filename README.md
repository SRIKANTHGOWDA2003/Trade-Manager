# 📊 Trade Manager

A comprehensive web-based trade management application designed to help traders track, analyze, and improve their trading performance. Track your trades, monitor profitability, and gain valuable insights into your trading patterns.

## ✨ Features

### 📈 Trade Management
- **Complete Trade Entry**: Log all essential trade details including date, symbol, entry/exit prices, position size, and more
- **Trade Types**: Support for both Buy/Long and Sell/Short positions
- **Flexible Position Sizing**: Track various position sizes and contract quantities
- **Fee Tracking**: Include commissions and fees in your profit/loss calculations
- **Strategy Notes**: Document your trading strategies and trade-specific notes

### 📊 Analytics & Insights
- **Real-time P&L Calculations**: Automatic profit/loss and ROI calculations
- **Performance Charts**: Visual representation of your cumulative returns over time
- **Win Rate Analysis**: Track your winning percentage and average returns
- **Strategy Performance**: Compare performance across different trading strategies
- **Monthly Breakdown**: View your profit/loss by month with interactive charts

### 🔍 Data Management
- **Search & Filter**: Quickly find specific trades or filter by trade type
- **Sortable Tables**: Sort your trade history by any column
- **Edit & Delete**: Update or remove trades as needed
- **CSV Export**: Export your trade data for external analysis
- **Local Storage**: All data saved securely in your browser

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design with intuitive navigation
- **Offline Functionality**: Works completely offline without internet connection
- **Fast Performance**: Lightweight application with instant loading

## 🚀 Quick Start

### Method 1: Direct Download
1. **Download** the files to your computer
2. **Open `index.html`** in your web browser
3. **Start tracking trades** immediately!

### Method 2: Clone from GitHub
```bash
git clone https://github.com/yourusername/trade-manager.git
cd trade-manager
```

### Method 3: Live Demo
Visit the live demo: [Your GitHub Pages URL]

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required
- No internet connection needed after initial download

## 💻 Usage Guide

### Adding Your First Trade

1. **Navigate to the "Add Trade" tab**
2. **Fill in the trade details**:
   - **Date & Time**: When the trade was executed
   - **Symbol**: Trading pair (e.g., AAPL, EUR/USD)
   - **Trade Type**: Buy/Long or Sell/Short
   - **Entry Price**: Your entry price
   - **Exit Price**: Your exit price
   - **Position Size**: Your position size
   - **Quantity**: Number of shares/contracts
   - **Fees**: Any commissions or fees
   - **Strategy**: Trading strategy used
   - **Notes**: Additional trade details

3. **Click "Save Trade"** to record the trade

### Analyzing Performance

1. **Visit the "Analytics" tab** to view:
   - **Summary Statistics**: Total trades, win rate, total P&L
   - **Performance Chart**: Cumulative returns over time
   - **Strategy Breakdown**: Performance by strategy
   - **Monthly Analysis**: Monthly profit/loss chart

2. **Use the "Trade History" tab** to:
   - **View all trades** in a sortable table
   - **Search for specific trades**
   - **Filter by trade type**
   - **Edit or delete trades**
   - **Export data to CSV**

## 🏗️ Project Structure

```
trade-manager/
├── index.html          # Main application file
├── styles.css          # Styling and responsive design
├── script.js           # Application logic and functionality
├── README.md           # This file
├── package.json        # Project metadata
├── LICENSE             # MIT License
└── .gitignore          # Git ignore file
```

## 🛠️ Technology Stack

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript with modern features
- **Chart.js**: Interactive charts and data visualization
- **Font Awesome**: Professional icons
- **LocalStorage**: Browser-based data persistence

## 📊 Key Features Explained

### Profit & Loss Calculations
The application automatically calculates:
- **Gross P&L**: (Exit Price - Entry Price) × Quantity
- **Net P&L**: Gross P&L - Fees
- **ROI Percentage**: (Net P&L ÷ Investment) × 100
- **Position Types**: Correctly handles both long and short positions

### Data Persistence
- **All trades stored locally** in browser localStorage
- **No server required** - works completely offline
- **Data persists between browser sessions**
- **Export functionality** for data backup

### Responsive Design
- **Mobile-first approach** with progressive enhancement
- **Touch-friendly interface** for mobile devices
- **Adaptive layouts** for different screen sizes
- **Accessible design** following WCAG guidelines

## 🔧 Customization

### Adding Custom Strategies
Edit the `script.js` file to add your custom trading strategies and analytics.

### Custom Styling
Modify the `styles.css` file to customize colors, fonts, and layout.

### Advanced Features
The codebase is structured for easy extension with features like:
- Multiple portfolio support
- Advanced risk metrics
- Import from brokerage APIs
- Custom timeframes and filters

## 📝 Data Fields

| Field | Description | Required |
|-------|-------------|----------|
| Date & Time | Trade execution timestamp | ✅ |
| Symbol | Trading symbol or pair | ✅ |
| Trade Type | Buy/Long or Sell/Short | ✅ |
| Entry Price | Price at trade entry | ✅ |
| Exit Price | Price at trade exit | ✅ |
| Position Size | Size of the position | ✅ |
| Quantity | Number of shares/contracts | ✅ |
| Fees | Commissions and fees | ❌ |
| Strategy | Trading strategy used | ❌ |
| Notes | Additional trade details | ❌ |

## 🚀 Deployment

### GitHub Pages (Free)
1. **Fork this repository**
2. **Go to Settings → Pages**
3. **Select main branch as source**
4. **Your site will be live** at `https://yourusername.github.io/trade-manager`

### Other Hosting Options
- **Netlify**: Drag and drop the files for instant deployment
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Free static hosting
- **Any static hosting service**: Upload the HTML, CSS, and JS files

## 🔒 Security & Privacy

- **100% Private**: All data stored locally in your browser
- **No data transmission**: No information sent to external servers
- **Offline functionality**: Works without internet connection
- **Secure calculations**: All computations performed client-side

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/trade-manager.git

# Navigate to the project directory
cd trade-manager

# Open index.html in your browser to start development
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Issues**: Report bugs or request features on GitHub Issues
- **Discussions**: Ask questions and share your experiences
- **Documentation**: Check this README for detailed usage instructions

## 🌟 Acknowledgments

- **Chart.js** for beautiful, interactive charts
- **Font Awesome** for professional icons
- **Modern JavaScript features** for clean, maintainable code
- **CSS Grid and Flexbox** for responsive layouts

## 📈 Roadmap

Future enhancements planned:
- [ ] Import data from brokerage accounts
- [ ] Advanced risk metrics (Sharpe ratio, maximum drawdown)
- [ ] Multiple portfolio support
- [ ] Custom timeframes and date ranges
- [ ] Trade journal with screenshots
- [ ] Performance alerts and notifications
- [ ] Export to multiple formats (Excel, PDF)
- [ ] Advanced filtering options
- [ ] Strategy backtesting tools
- [ ] Economic calendar integration

---

**Happy Trading! 📊💰**

Built with ❤️ for traders who want to track and improve their performance.

---

**⚠️ Disclaimer**: This tool is for educational and tracking purposes only. Always do your own research before making trading decisions.