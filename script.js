// Advanced Trade Manager with Authentication and Modern UI
class TradeManager {
    constructor() {
        this.currentUser = null;
        this.trades = [];
        this.currentSort = { field: 'date', order: 'desc' };
        this.currentFilter = { type: '', search: '', strategy: '' };
        this.editingTradeId = null;
        this.calendarView = 'month';
        this.currentDate = new Date();
        this.pagination = { currentPage: 1, itemsPerPage: 10 };
        this.charts = {};
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.initCharts();

        // Set default date to current datetime
        const now = new Date();
        const dateInput = document.getElementById('trade-date');
        if (dateInput) {
            dateInput.value = now.toISOString().slice(0, 16);
        }
    }

    // Authentication System
    checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            this.currentUser = user;
            this.showApp();
            this.loadUserData();
        } else {
            this.showAuthScreen();
        }
    }

    showAuthScreen() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
        this.bindAuthEvents();
    }

    showApp() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        this.updateUserProfile();
        this.bindAppEvents();
        this.updateDashboard();
        this.generateCalendar();
    }

    bindAuthEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[username];

        if (!user || user.password !== this.hashPassword(password)) {
            this.showNotification('Invalid username or password', 'error');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showNotification('Login successful!', 'success');
        this.showApp();
    }

    handleSignup() {
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const fullName = document.getElementById('signup-fullname').value;

        if (!username || !email || !password || !fullName) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');

        if (users[username]) {
            this.showNotification('Username already exists', 'error');
            return;
        }

        const newUser = {
            id: this.generateId(),
            username,
            email,
            fullName,
            password: this.hashPassword(password),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`,
            createdAt: new Date().toISOString()
        };

        users[username] = newUser;
        localStorage.setItem('users', JSON.stringify(users));

        // Initialize user's trade data
        localStorage.setItem(`trades_${username}`, JSON.stringify([]));

        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.showNotification('Account created successfully!', 'success');
        this.showApp();
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.trades = [];
        this.showNotification('Logged out successfully', 'success');
        this.showAuthScreen();
    }

    updateUserProfile() {
        if (!this.currentUser) return;

        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');

        if (userAvatar) userAvatar.src = this.currentUser.avatar;
        if (userName) userName.textContent = this.currentUser.fullName || this.currentUser.username;
    }

    loadUserData() {
        if (!this.currentUser) return;

        const tradesData = localStorage.getItem(`trades_${this.currentUser.username}`);
        this.trades = tradesData ? JSON.parse(tradesData) : [];

        this.updateTradesTable();
        this.updateAnalytics();
        this.updateDashboard();
        this.updateStrategyFilter();
    }

    // Data Management
    saveTrades() {
        if (!this.currentUser) return;
        localStorage.setItem(`trades_${this.currentUser.username}`, JSON.stringify(this.trades));
    }

    // Form and UI Functions
    bindAppEvents() {
        // Trade form submission
        const tradeForm = document.getElementById('trade-form');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTrade();
            });
        }

        // Search and filters
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilter.search = e.target.value;
                this.updateTradesTable();
            });
        }

        const filterType = document.getElementById('filter-type');
        if (filterType) {
            filterType.addEventListener('change', (e) => {
                this.currentFilter.type = e.target.value;
                this.updateTradesTable();
            });
        }

        const filterStrategy = document.getElementById('filter-strategy');
        if (filterStrategy) {
            filterStrategy.addEventListener('change', (e) => {
                this.currentFilter.strategy = e.target.value;
                this.updateTradesTable();
            });
        }

        // Analytics period filter
        const analyticsPeriod = document.getElementById('analytics-period');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', () => {
                this.updateAnalytics();
            });
        }

        // Real-time P&L preview
        ['entry-price', 'exit-price', 'quantity', 'fees'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateTradePreview());
            }
        });
    }

    selectTradeType(type) {
        const buyBtn = document.querySelector('.buy-btn');
        const sellBtn = document.querySelector('.sell-btn');
        const hiddenInput = document.getElementById('trade-type');

        if (type === 'BUY') {
            buyBtn.classList.add('selected');
            sellBtn.classList.remove('selected');
        } else {
            sellBtn.classList.add('selected');
            buyBtn.classList.remove('selected');
        }

        hiddenInput.value = type;
        this.updateTradePreview();
    }

    updateTradePreview() {
        const entryPrice = parseFloat(document.getElementById('entry-price').value) || 0;
        const exitPrice = parseFloat(document.getElementById('exit-price').value) || 0;
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const fees = parseFloat(document.getElementById('fees').value) || 0;
        const tradeType = document.getElementById('trade-type').value;

        if (!entryPrice || !exitPrice || !quantity || !tradeType) {
            document.getElementById('preview-pl').textContent = '$0.00';
            document.getElementById('preview-roi').textContent = '0%';
            return;
        }

        const priceDiff = exitPrice - entryPrice;
        const grossPL = priceDiff * quantity;
        const netPL = tradeType === 'SELL' ? -grossPL - fees : grossPL - fees;
        const investment = entryPrice * quantity;
        const roi = investment > 0 ? (netPL / investment) * 100 : 0;

        const plElement = document.getElementById('preview-pl');
        const roiElement = document.getElementById('preview-roi');

        plElement.textContent = `$${netPL.toFixed(2)}`;
        roiElement.textContent = `${roi.toFixed(2)}%`;

        plElement.className = netPL >= 0 ? 'profit-amount' : 'loss-amount';
        roiElement.className = roi >= 0 ? 'roi-amount' : 'loss-amount';
    }

    saveTrade() {
        const tradeType = document.getElementById('trade-type').value;
        if (!tradeType) {
            this.showNotification('Please select a trade type', 'error');
            return;
        }

        const formData = {
            id: this.editingTradeId || this.generateId(),
            date: document.getElementById('trade-date').value,
            symbol: document.getElementById('symbol').value.toUpperCase(),
            tradeType,
            entryPrice: parseFloat(document.getElementById('entry-price').value),
            exitPrice: parseFloat(document.getElementById('exit-price').value),
            positionSize: parseFloat(document.getElementById('position-size').value) || 0,
            quantity: parseFloat(document.getElementById('quantity').value),
            fees: parseFloat(document.getElementById('fees').value) || 0,
            strategy: document.getElementById('strategy').value,
            notes: document.getElementById('notes').value,
            tags: document.getElementById('tags').value,
            userId: this.currentUser.id
        };

        formData.profitLoss = this.calculateProfitLoss(formData);
        formData.roi = this.calculateROI(formData);

        if (this.editingTradeId) {
            const index = this.trades.findIndex(t => t.id === this.editingTradeId);
            if (index !== -1) {
                this.trades[index] = formData;
            }
            this.editingTradeId = null;
        } else {
            this.trades.push(formData);
        }

        this.saveTrades();
        this.updateTradesTable();
        this.updateAnalytics();
        this.updateDashboard();
        this.generateCalendar();
        this.updateStrategyFilter();

        // Reset form
        this.resetTradeForm();
        this.showNotification('Trade saved successfully!', 'success');
    }

    resetTradeForm() {
        document.getElementById('trade-form').reset();
        document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('selected'));
        const now = new Date();
        document.getElementById('trade-date').value = now.toISOString().slice(0, 16);
        this.updateTradePreview();
    }

    editTrade(id) {
        const trade = this.trades.find(t => t.id === id);
        if (!trade) return;

        document.getElementById('trade-date').value = trade.date;
        document.getElementById('symbol').value = trade.symbol;
        document.getElementById('trade-type').value = trade.tradeType;
        this.selectTradeType(trade.tradeType);
        document.getElementById('entry-price').value = trade.entryPrice;
        document.getElementById('exit-price').value = trade.exitPrice;
        document.getElementById('position-size').value = trade.positionSize;
        document.getElementById('quantity').value = trade.quantity;
        document.getElementById('fees').value = trade.fees;
        document.getElementById('strategy').value = trade.strategy || '';
        document.getElementById('notes').value = trade.notes || '';
        document.getElementById('tags').value = trade.tags || '';

        this.editingTradeId = id;

        showSection('add-trade');
        document.getElementById('add-trade').scrollIntoView({ behavior: 'smooth' });
    }

    deleteTrade(id) {
        if (confirm('Are you sure you want to delete this trade?')) {
            this.trades = this.trades.filter(t => t.id !== id);
            this.saveTrades();
            this.updateTradesTable();
            this.updateAnalytics();
            this.updateDashboard();
            this.generateCalendar();
            this.showNotification('Trade deleted successfully!', 'success');
        }
    }

    calculateProfitLoss(trade) {
        const priceDiff = trade.exitPrice - trade.entryPrice;
        const grossPL = priceDiff * trade.quantity;
        return trade.tradeType === 'SELL' ? -grossPL - trade.fees : grossPL - trade.fees;
    }

    calculateROI(trade) {
        const investment = trade.entryPrice * trade.quantity;
        const pl = this.calculateProfitLoss(trade);
        return investment > 0 ? (pl / investment) * 100 : 0;
    }

    // Table Functions
    getFilteredAndSortedTrades() {
        let filtered = [...this.trades];

        // Apply filters
        if (this.currentFilter.type) {
            filtered = filtered.filter(trade => trade.tradeType === this.currentFilter.type);
        }

        if (this.currentFilter.strategy) {
            filtered = filtered.filter(trade => trade.strategy === this.currentFilter.strategy);
        }

        if (this.currentFilter.search) {
            const search = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(trade =>
                trade.symbol.toLowerCase().includes(search) ||
                (trade.strategy && trade.strategy.toLowerCase().includes(search)) ||
                (trade.notes && trade.notes.toLowerCase().includes(search)) ||
                (trade.tags && trade.tags.toLowerCase().includes(search))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal, bVal;

            switch (this.currentSort.field) {
                case 'date':
                    aVal = new Date(a.date);
                    bVal = new Date(b.date);
                    break;
                case 'symbol':
                    aVal = a.symbol;
                    bVal = b.symbol;
                    break;
                case 'type':
                    aVal = a.tradeType;
                    bVal = b.tradeType;
                    break;
                case 'entry':
                    aVal = a.entryPrice;
                    bVal = b.entryPrice;
                    break;
                case 'exit':
                    aVal = a.exitPrice;
                    bVal = b.exitPrice;
                    break;
                case 'quantity':
                    aVal = a.quantity;
                    bVal = b.quantity;
                    break;
                case 'pl':
                    aVal = a.profitLoss;
                    bVal = b.profitLoss;
                    break;
                case 'roi':
                    aVal = a.roi;
                    bVal = b.roi;
                    break;
                case 'strategy':
                    aVal = a.strategy || '';
                    bVal = b.strategy || '';
                    break;
                default:
                    return 0;
            }

            if (aVal < bVal) return this.currentSort.order === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.order === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }

    updateTradesTable() {
        const tbody = document.getElementById('trades-tbody');
        const noTrades = document.getElementById('no-trades');
        const filtered = this.getFilteredAndSortedTrades();

        // Apply pagination
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        const paginatedData = filtered.slice(startIndex, endIndex);

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            noTrades.style.display = 'block';
            this.updatePagination(0);
            return;
        }

        noTrades.style.display = 'none';
        tbody.innerHTML = paginatedData.map(trade => `
            <tr>
                <td>${new Date(trade.date).toLocaleString()}</td>
                <td><strong>${trade.symbol}</strong></td>
                <td><span class="badge ${trade.tradeType === 'BUY' ? 'badge-buy' : 'badge-sell'}">${trade.tradeType}</span></td>
                <td>$${trade.entryPrice.toFixed(2)}</td>
                <td>$${trade.exitPrice.toFixed(2)}</td>
                <td>${trade.quantity.toFixed(2)}</td>
                <td class="${trade.profitLoss >= 0 ? 'profit' : 'loss'}">
                    $${trade.profitLoss.toFixed(2)}
                </td>
                <td class="${trade.roi >= 0 ? 'profit' : 'loss'}">
                    ${trade.roi.toFixed(2)}%
                </td>
                <td>${trade.strategy || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="tradeManager.editTrade('${trade.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="tradeManager.deleteTrade('${trade.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination(filtered.length);
    }

    updatePagination(totalRecords) {
        const totalPages = Math.ceil(totalRecords / this.pagination.itemsPerPage);
        const currentPage = this.pagination.currentPage;

        document.getElementById('showing-start').textContent = totalRecords > 0 ?
            ((currentPage - 1) * this.pagination.itemsPerPage) + 1 : 0;
        document.getElementById('showing-end').textContent = Math.min(
            currentPage * this.pagination.itemsPerPage,
            totalRecords
        );
        document.getElementById('total-records').textContent = totalRecords;
        document.getElementById('current-page').textContent = currentPage;
        document.getElementById('total-pages').textContent = totalPages;

        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    }

    changePage(direction) {
        const filtered = this.getFilteredAndSortedTrades();
        const totalPages = Math.ceil(filtered.length / this.pagination.itemsPerPage);

        this.pagination.currentPage = Math.max(1, Math.min(totalPages,
            this.pagination.currentPage + direction));

        this.updateTradesTable();
    }

    updateStrategyFilter() {
        const strategies = [...new Set(this.trades.map(t => t.strategy).filter(s => s))];
        const filterSelect = document.getElementById('filter-strategy');

        if (filterSelect) {
            const currentValue = filterSelect.value;
            filterSelect.innerHTML = '<option value="">All Strategies</option>';
            strategies.forEach(strategy => {
                filterSelect.innerHTML += `<option value="${strategy}">${strategy}</option>`;
            });
            filterSelect.value = currentValue;
        }
    }

    // Dashboard Functions
    updateDashboard() {
        if (this.trades.length === 0) {
            document.getElementById('total-profit').textContent = '$0.00';
            document.getElementById('total-trades').textContent = '0';
            document.getElementById('win-rate').textContent = '0%';
            document.getElementById('current-streak').textContent = '0';
            return;
        }

        const winningTrades = this.trades.filter(t => t.profitLoss > 0);
        const totalPL = this.trades.reduce((sum, t) => sum + t.profitLoss, 0);
        const winRate = (winningTrades.length / this.trades.length) * 100;
        const currentStreak = this.calculateCurrentStreak();

        document.getElementById('total-profit').textContent = `$${totalPL.toFixed(2)}`;
        document.getElementById('total-trades').textContent = this.trades.length;
        document.getElementById('win-rate').textContent = `${winRate.toFixed(1)}%`;
        document.getElementById('current-streak').textContent = currentStreak;

        // Color code total profit
        const profitElement = document.getElementById('total-profit');
        profitElement.className = totalPL >= 0 ? 'profit' : 'loss';
    }

    calculateCurrentStreak() {
        if (this.trades.length === 0) return 0;

        const sortedTrades = [...this.trades].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        let streak = 0;
        for (const trade of sortedTrades) {
            if (trade.profitLoss > 0) {
                streak++;
            } else if (trade.profitLoss < 0) {
                break;
            }
        }
        return streak;
    }

    // Analytics Functions
    updateAnalytics() {
        this.updateSummaryStats();
        this.updateStrategyStats();
        this.updatePerformanceChart();
        this.updateMonthlyChart();
        this.updateRiskMetrics();
        this.updateDistributionCharts();
        this.updateRecentPerformance();
    }

    updateSummaryStats() {
        const period = document.getElementById('analytics-period')?.value || 'all';
        let filteredTrades = this.getFilteredTradesByPeriod(period);

        if (filteredTrades.length === 0) {
            this.resetAnalyticsStats();
            return;
        }

        const winningTrades = filteredTrades.filter(t => t.profitLoss > 0);
        const totalPL = filteredTrades.reduce((sum, t) => sum + t.profitLoss, 0);
        const avgPL = totalPL / filteredTrades.length;
        const maxWin = Math.max(...filteredTrades.map(t => t.profitLoss));
        const maxLoss = Math.min(...filteredTrades.map(t => t.profitLoss));

        document.getElementById('analytics-total-pl').textContent = `$${totalPL.toFixed(2)}`;
        document.getElementById('analytics-total-trades').textContent = filteredTrades.length;
        document.getElementById('analytics-winrate').textContent = `${((winningTrades.length / filteredTrades.length) * 100).toFixed(1)}%`;
        document.getElementById('analytics-avg-pl').textContent = `$${avgPL.toFixed(2)}`;

        // Update change indicators
        this.updateChangeIndicators(filteredTrades);
    }

    getFilteredTradesByPeriod(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return this.trades;
        }

        return this.trades.filter(trade => new Date(trade.date) >= startDate);
    }

    updateChangeIndicators(trades) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const recentTrades = trades.filter(t => new Date(t.date) >= lastMonth);
        const previousTrades = this.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate < lastMonth && tradeDate >= new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000);
        });

        if (recentTrades.length > 0 && previousTrades.length > 0) {
            const recentPL = recentTrades.reduce((sum, t) => sum + t.profitLoss, 0);
            const previousPL = previousTrades.reduce((sum, t) => sum + t.profitLoss, 0);
            const change = previousPL !== 0 ? ((recentPL - previousPL) / Math.abs(previousPL)) * 100 : 0;

            const changeElement = document.getElementById('pl-change');
            if (changeElement) {
                changeElement.className = `kpi-change ${change >= 0 ? 'positive' : 'negative'}`;
                changeElement.innerHTML = `
                    <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                    ${change >= 0 ? '+' : ''}${change.toFixed(1)}%
                `;
            }
        }
    }

    resetAnalyticsStats() {
        document.getElementById('analytics-total-pl').textContent = '$0.00';
        document.getElementById('analytics-total-trades').textContent = '0';
        document.getElementById('analytics-winrate').textContent = '0%';
        document.getElementById('analytics-avg-pl').textContent = '$0.00';
    }

    updateStrategyStats() {
        const strategies = {};

        this.trades.forEach(trade => {
            const strategy = trade.strategy || 'No Strategy';
            if (!strategies[strategy]) {
                strategies[strategy] = {
                    trades: 0,
                    totalPL: 0,
                    wins: 0,
                    totalInvestment: 0
                };
            }
            strategies[strategy].trades++;
            strategies[strategy].totalPL += trade.profitLoss;
            strategies[strategy].totalInvestment += trade.entryPrice * trade.quantity;
            if (trade.profitLoss > 0) strategies[strategy].wins++;
        });

        const container = document.getElementById('strategy-stats');
        if (!container) return;

        if (Object.keys(strategies).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No strategy data available</p>';
            return;
        }

        const strategyHTML = Object.entries(strategies)
            .sort((a, b) => b[1].totalPL - a[1].totalPL)
            .map(([name, stats]) => {
                const winRate = (stats.wins / stats.trades * 100).toFixed(1);
                const avgROI = stats.totalInvestment > 0 ?
                    (stats.totalPL / stats.totalInvestment * 100).toFixed(1) : 0;

                return `
                    <div class="strategy-item">
                        <div>
                            <strong>${name}</strong>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                                ${stats.trades} trades • ${winRate}% win rate
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="${stats.totalPL >= 0 ? 'profit' : 'loss'}" style="font-weight: 600;">
                                $${stats.totalPL.toFixed(2)}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                ${avgROI}% avg ROI
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        container.innerHTML = strategyHTML;
    }

    updateRiskMetrics() {
        if (this.trades.length === 0) {
            document.getElementById('max-drawdown').textContent = '$0.00';
            document.getElementById('sharpe-ratio').textContent = '0.00';
            document.getElementById('profit-factor').textContent = '0.00';
            document.getElementById('win-loss-ratio').textContent = '0.00';
            return;
        }

        const sortedTrades = [...this.trades].sort((a, b) => new Date(a.date) - new Date(b.date));
        const runningTotal = [];
        let cumulative = 0;
        let maxDrawdown = 0;
        let peak = 0;

        sortedTrades.forEach(trade => {
            cumulative += trade.profitLoss;
            runningTotal.push(cumulative);
            if (cumulative > peak) peak = cumulative;
            const drawdown = peak - cumulative;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        });

        const wins = this.trades.filter(t => t.profitLoss > 0);
        const losses = this.trades.filter(t => t.profitLoss < 0);

        const totalWins = wins.reduce((sum, t) => sum + t.profitLoss, 0);
        const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0));
        const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
        const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

        const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
        const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

        // Simple Sharpe ratio calculation
        const returns = sortedTrades.map(t => t.profitLoss);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

        document.getElementById('max-drawdown').textContent = `$${maxDrawdown.toFixed(2)}`;
        document.getElementById('sharpe-ratio').textContent = sharpeRatio.toFixed(2);
        document.getElementById('profit-factor').textContent = profitFactor.toFixed(2);
        document.getElementById('win-loss-ratio').textContent = winLossRatio.toFixed(2);

        // Update drawdown bar
        const drawdownBar = document.getElementById('drawdown-bar');
        if (drawdownBar) {
            const totalPL = this.trades.reduce((sum, t) => sum + t.profitLoss, 0);
            const percentage = totalPL > 0 ? (maxDrawdown / Math.abs(totalPL)) * 100 : 0;
            drawdownBar.style.width = `${Math.min(100, percentage)}%`;
        }
    }

    // Calendar Functions
    generateCalendar() {
        const container = document.getElementById('calendar-grid');
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let calendarHTML = '<div class="calendar-weekdays">';
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            calendarHTML += `<div class="calendar-weekday">${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar-days">';

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrades = this.trades.filter(trade =>
                trade.date.startsWith(dateStr)
            );

            const dayPL = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
            const dayClass = this.getCalendarDayClass(dayTrades, dayPL);
            const isToday = this.isToday(year, month, day);

            calendarHTML += `
                <div class="calendar-day ${dayClass} ${isToday ? 'today' : ''}"
                     onclick="showDayTrades('${dateStr}')"
                     title="${dayTrades.length} trades, P&L: $${dayPL.toFixed(2)}">
                    <div class="calendar-day-number">${day}</div>
                    ${dayTrades.length > 0 ? `
                        <div class="calendar-day-indicators">
                            ${dayPL >= 0 ?
                                `<div class="calendar-pl profit">$${dayPL.toFixed(0)}</div>` :
                                `<div class="calendar-pl loss">-$${Math.abs(dayPL).toFixed(0)}</div>`
                            }
                            <div class="calendar-trade-count">${dayTrades.length}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        calendarHTML += '</div>';
        container.innerHTML = calendarHTML;

        // Update calendar title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('calendar-title').textContent = `${monthNames[month]} ${year}`;

        // Update monthly summary
        this.updateCalendarSummary(year, month);
    }

    getCalendarDayClass(trades, pl) {
        if (trades.length === 0) return 'no-trades';
        if (trades.length === 1) return pl >= 0 ? 'profit-day' : 'loss-day';

        const wins = trades.filter(t => t.profitLoss > 0).length;
        const losses = trades.filter(t => t.profitLoss < 0).length;

        if (wins === trades.length) return 'profit-day';
        if (losses === trades.length) return 'loss-day';
        return 'mixed-day';
    }

    isToday(year, month, day) {
        const today = new Date();
        return year === today.getFullYear() &&
               month === today.getMonth() &&
               day === today.getDate();
    }

    updateCalendarSummary(year, month) {
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthTrades = this.trades.filter(trade => trade.date.startsWith(monthStr));

        const totalPL = monthTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
        const tradingDays = new Set(monthTrades.map(t => t.date.split(' ')[0])).size;
        const wins = monthTrades.filter(t => t.profitLoss > 0).length;
        const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0;

        const plElement = document.getElementById('monthly-pl');
        if (plElement) {
            plElement.textContent = `$${totalPL.toFixed(2)}`;
            plElement.className = `summary-value ${totalPL >= 0 ? 'profit' : 'loss'}`;
        }

        const daysElement = document.getElementById('monthly-days');
        if (daysElement) daysElement.textContent = tradingDays;

        const winrateElement = document.getElementById('monthly-winrate');
        if (winrateElement) winrateElement.textContent = `${winRate.toFixed(1)}%`;
    }

    changeCalendarMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.generateCalendar();
    }

    navigateCalendar(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.generateCalendar();
    }

    // Chart Functions
    initCharts() {
        // Initialize Chart.js configurations
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = '#334155';
        Chart.defaults.font.family = "'Inter', sans-serif";
    }

    updatePerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.trades.length === 0) {
            this.showNoDataChart(ctx);
            return;
        }

        const sortedTrades = [...this.trades].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedTrades.map((_, index) => `Trade ${index + 1}`);
        const cumulativePL = [];
        let runningTotal = 0;

        sortedTrades.forEach(trade => {
            runningTotal += trade.profitLoss;
            cumulativePL.push(runningTotal);
        });

        // Destroy existing chart if it exists
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative P&L',
                    data: cumulativePL,
                    borderColor: cumulativePL[cumulativePL.length - 1] >= 0 ? '#10b981' : '#ef4444',
                    backgroundColor: cumulativePL[cumulativePL.length - 1] >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f1f5f9',
                        bodyColor: '#94a3b8',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `P&L: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    updateMonthlyChart() {
        const canvas = document.getElementById('monthly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.trades.length === 0) {
            this.showNoDataChart(ctx);
            return;
        }

        const monthlyData = {};

        this.trades.forEach(trade => {
            const date = new Date(trade.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { pl: 0, trades: 0 };
            }
            monthlyData[monthKey].pl += trade.profitLoss;
            monthlyData[monthKey].trades++;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const labels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        });
        const data = sortedMonths.map(month => monthlyData[month].pl);

        // Destroy existing chart if it exists
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly P&L',
                    data: data,
                    backgroundColor: data.map(value => value >= 0 ? '#10b981' : '#ef4444'),
                    borderColor: data.map(value => value >= 0 ? '#059669' : '#dc2626'),
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        callbacks: {
                            label: function(context) {
                                return `P&L: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#334155'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    updateDistributionCharts() {
        this.updateTradeTypeChart();
        this.updateDayOfWeekChart();
    }

    updateTradeTypeChart() {
        const canvas = document.getElementById('trade-type-chart');
        if (!canvas || this.trades.length === 0) return;

        const ctx = canvas.getContext('2d');

        const buyTrades = this.trades.filter(t => t.tradeType === 'BUY').length;
        const sellTrades = this.trades.filter(t => t.tradeType === 'SELL').length;

        if (this.charts.tradeType) {
            this.charts.tradeType.destroy();
        }

        this.charts.tradeType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Buy/Long', 'Sell/Short'],
                datasets: [{
                    data: [buyTrades, sellTrades],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    updateDayOfWeekChart() {
        const canvas = document.getElementById('dayofweek-chart');
        if (!canvas || this.trades.length === 0) return;

        const ctx = canvas.getContext('2d');

        const dayData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        this.trades.forEach(trade => {
            const day = new Date(trade.date).getDay();
            dayData[day]++;
        });

        if (this.charts.dayOfWeek) {
            this.charts.dayOfWeek.destroy();
        }

        this.charts.dayOfWeek = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dayNames,
                datasets: [{
                    label: 'Trades',
                    data: dayData,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateRecentPerformance() {
        const container = document.getElementById('recent-trades-summary');
        if (!container) return;

        const recentTrades = this.trades
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (recentTrades.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No recent trades</p>';
            return;
        }

        const summaryHTML = recentTrades.map(trade => `
            <div class="strategy-item">
                <div>
                    <strong>${trade.symbol}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                        ${new Date(trade.date).toLocaleDateString()} • ${trade.strategy || 'No strategy'}
                    </div>
                </div>
                <div class="${trade.profitLoss >= 0 ? 'profit' : 'loss'}" style="font-weight: 600;">
                    $${trade.profitLoss.toFixed(2)}
                </div>
            </div>
        `).join('');

        container.innerHTML = summaryHTML;
    }

    showNoDataChart(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    hashPassword(password) {
        // Simple hash for demonstration - in production, use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 400px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Global Functions
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.querySelector('.auth-tab:nth-child(1)');
    const signupTab = document.querySelector('.auth-tab:nth-child(2)');

    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.nav-btn').classList.add('active');

    // Update calendar when switching to calendar tab
    if (sectionId === 'calendar' && tradeManager) {
        tradeManager.generateCalendar();
    }
}

function sortTrades(field) {
    if (tradeManager.currentSort.field === field) {
        tradeManager.currentSort.order = tradeManager.currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        tradeManager.currentSort.field = field;
        tradeManager.currentSort.order = 'desc';
    }
    tradeManager.updateTradesTable();
}

function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    userMenu.classList.toggle('show');
}

function showProfile() {
    toggleUserMenu();
    if (tradeManager.currentUser) {
        alert(`Profile: ${tradeManager.currentUser.fullName}\nEmail: ${tradeManager.currentUser.email}\nMember since: ${new Date(tradeManager.currentUser.createdAt).toLocaleDateString()}`);
    }
}

function showSettings() {
    toggleUserMenu();
    alert('Settings coming soon!');
}

function exportTrades() {
    const trades = tradeManager.getFilteredAndSortedTrades();

    if (trades.length === 0) {
        tradeManager.showNotification('No trades to export', 'error');
        return;
    }

    const headers = ['Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Quantity', 'Fees', 'Strategy', 'P&L', 'ROI%', 'Notes', 'Tags'];
    const csvContent = [
        headers.join(','),
        ...trades.map(trade => [
            trade.date,
            trade.symbol,
            trade.tradeType,
            trade.entryPrice,
            trade.exitPrice,
            trade.quantity,
            trade.fees,
            `"${trade.strategy || ''}"`,
            trade.profitLoss.toFixed(2),
            trade.roi.toFixed(2),
            `"${trade.notes || ''}"`,
            `"${trade.tags || ''}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    tradeManager.showNotification('Trades exported successfully!', 'success');
}

function changePage(direction) {
    tradeManager.changePage(direction);
}

function changeCalendarView(view) {
    tradeManager.calendarView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    // Implementation for different calendar views would go here
}

function changeCalendarMonth(direction) {
    tradeManager.changeCalendarMonth(direction);
}

function navigateCalendar(direction) {
    tradeManager.navigateCalendar(direction);
}

function showDayTrades(dateStr) {
    const dayTrades = tradeManager.trades.filter(trade =>
        trade.date.startsWith(dateStr)
    );

    if (dayTrades.length === 0) {
        tradeManager.showNotification('No trades on this day', 'error');
        return;
    }

    const totalPL = dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
    const summary = `
        ${dayTrades.length} trades on ${dateStr}
        Total P&L: $${totalPL.toFixed(2)}
    `;

    tradeManager.showNotification(summary, 'success');
}

function selectTradeType(type) {
    tradeManager.selectTradeType(type);
}

function loadTemplateTrade() {
    // Load template trade data
    document.getElementById('strategy').value = 'Scalping';
    document.getElementById('position-size').value = '1000';
    document.getElementById('fees').value = '2.5';
    tradeManager.showNotification('Template loaded', 'success');
}

function resetForm() {
    tradeManager.resetTradeForm();
}

function saveAsDraft() {
    tradeManager.showNotification('Draft saved (feature coming soon)', 'success');
}

function refreshAnalytics() {
    tradeManager.updateAnalytics();
    tradeManager.showNotification('Analytics refreshed', 'success');
}

function showStrategyDetails() {
    tradeManager.showNotification('Strategy details coming soon', 'success');
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('user-menu');
    const userProfile = document.querySelector('.user-profile');

    if (userProfile && !userProfile.contains(e.target) && userMenu && !userMenu.contains(e.target)) {
        userMenu.classList.remove('show');
    }
});

// Initialize the trade manager
const tradeManager = new TradeManager();