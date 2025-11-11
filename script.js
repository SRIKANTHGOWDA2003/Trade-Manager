class TradeManager {
    constructor() {
        this.trades = this.loadTrades();
        this.currentSort = { field: 'date', order: 'desc' };
        this.currentFilter = { type: '', search: '' };
        this.editingTradeId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateTradesTable();
        this.updateAnalytics();
    }

    bindEvents() {
        // Form submission
        document.getElementById('trade-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTrade();
        });

        // Search and filter
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.updateTradesTable();
        });

        document.getElementById('filter-type').addEventListener('change', (e) => {
            this.currentFilter.type = e.target.value;
            this.updateTradesTable();
        });

        // Set default date to current datetime
        const now = new Date();
        document.getElementById('trade-date').value = now.toISOString().slice(0, 16);
    }

    loadTrades() {
        const stored = localStorage.getItem('trades');
        return stored ? JSON.parse(stored) : [];
    }

    saveTrades() {
        localStorage.setItem('trades', JSON.stringify(this.trades));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    calculateProfitLoss(trade) {
        const priceDiff = trade.exitPrice - trade.entryPrice;
        const grossPL = priceDiff * trade.quantity;

        if (trade.tradeType === 'SELL') {
            return -grossPL - trade.fees;
        }

        return grossPL - trade.fees;
    }

    calculateROI(trade) {
        const investment = trade.entryPrice * trade.quantity;
        const pl = this.calculateProfitLoss(trade);
        return investment > 0 ? (pl / investment) * 100 : 0;
    }

    saveTrade() {
        const formData = {
            id: this.editingTradeId || this.generateId(),
            date: document.getElementById('trade-date').value,
            symbol: document.getElementById('symbol').value.toUpperCase(),
            tradeType: document.getElementById('trade-type').value,
            entryPrice: parseFloat(document.getElementById('entry-price').value),
            exitPrice: parseFloat(document.getElementById('exit-price').value),
            positionSize: parseFloat(document.getElementById('position-size').value),
            quantity: parseFloat(document.getElementById('quantity').value),
            fees: parseFloat(document.getElementById('fees').value) || 0,
            strategy: document.getElementById('strategy').value,
            notes: document.getElementById('notes').value
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

        // Reset form
        document.getElementById('trade-form').reset();
        const now = new Date();
        document.getElementById('trade-date').value = now.toISOString().slice(0, 16);

        // Show success message
        this.showNotification('Trade saved successfully!', 'success');
    }

    editTrade(id) {
        const trade = this.trades.find(t => t.id === id);
        if (!trade) return;

        document.getElementById('trade-date').value = trade.date;
        document.getElementById('symbol').value = trade.symbol;
        document.getElementById('trade-type').value = trade.tradeType;
        document.getElementById('entry-price').value = trade.entryPrice;
        document.getElementById('exit-price').value = trade.exitPrice;
        document.getElementById('position-size').value = trade.positionSize;
        document.getElementById('quantity').value = trade.quantity;
        document.getElementById('fees').value = trade.fees;
        document.getElementById('strategy').value = trade.strategy;
        document.getElementById('notes').value = trade.notes;

        this.editingTradeId = id;

        // Switch to add trade tab
        showSection('add-trade');

        // Scroll to form
        document.getElementById('add-trade').scrollIntoView({ behavior: 'smooth' });
    }

    deleteTrade(id) {
        if (confirm('Are you sure you want to delete this trade?')) {
            this.trades = this.trades.filter(t => t.id !== id);
            this.saveTrades();
            this.updateTradesTable();
            this.updateAnalytics();
            this.showNotification('Trade deleted successfully!', 'success');
        }
    }

    getFilteredAndSortedTrades() {
        let filtered = [...this.trades];

        // Apply filters
        if (this.currentFilter.type) {
            filtered = filtered.filter(trade => trade.tradeType === this.currentFilter.type);
        }

        if (this.currentFilter.search) {
            const search = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(trade =>
                trade.symbol.toLowerCase().includes(search) ||
                trade.strategy.toLowerCase().includes(search) ||
                trade.notes.toLowerCase().includes(search)
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
                case 'size':
                    aVal = a.positionSize;
                    bVal = b.positionSize;
                    break;
                case 'pl':
                    aVal = a.profitLoss;
                    bVal = b.profitLoss;
                    break;
                case 'roi':
                    aVal = a.roi;
                    bVal = b.roi;
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

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            noTrades.style.display = 'block';
            return;
        }

        noTrades.style.display = 'none';
        tbody.innerHTML = filtered.map(trade => `
            <tr>
                <td>${new Date(trade.date).toLocaleString()}</td>
                <td><strong>${trade.symbol}</strong></td>
                <td><span class="badge ${trade.tradeType === 'BUY' ? 'badge-buy' : 'badge-sell'}">${trade.tradeType}</span></td>
                <td>$${trade.entryPrice.toFixed(2)}</td>
                <td>$${trade.exitPrice.toFixed(2)}</td>
                <td>${trade.positionSize.toFixed(2)}</td>
                <td class="${trade.profitLoss >= 0 ? 'profit' : 'loss'}">
                    $${trade.profitLoss.toFixed(2)}
                </td>
                <td class="${trade.roi >= 0 ? 'profit' : 'loss'}">
                    ${trade.roi.toFixed(2)}%
                </td>
                <td>${trade.strategy || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="tradeManager.editTrade('${trade.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="tradeManager.deleteTrade('${trade.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateAnalytics() {
        this.updateSummaryStats();
        this.updateStrategyStats();
        this.updatePerformanceChart();
        this.updateMonthlyChart();
    }

    updateSummaryStats() {
        if (this.trades.length === 0) {
            document.getElementById('total-trades').textContent = '0';
            document.getElementById('win-rate').textContent = '0%';
            document.getElementById('total-pl').textContent = '$0.00';
            document.getElementById('avg-pl').textContent = '$0.00';
            document.getElementById('winning-trades').textContent = '0';
            document.getElementById('losing-trades').textContent = '0';
            document.getElementById('max-win').textContent = '$0.00';
            document.getElementById('max-loss').textContent = '$0.00';
            return;
        }

        const winningTrades = this.trades.filter(t => t.profitLoss > 0);
        const losingTrades = this.trades.filter(t => t.profitLoss < 0);
        const totalPL = this.trades.reduce((sum, t) => sum + t.profitLoss, 0);
        const avgPL = totalPL / this.trades.length;
        const maxWin = Math.max(...this.trades.map(t => t.profitLoss));
        const maxLoss = Math.min(...this.trades.map(t => t.profitLoss));

        document.getElementById('total-trades').textContent = this.trades.length;
        document.getElementById('win-rate').textContent = `${((winningTrades.length / this.trades.length) * 100).toFixed(1)}%`;
        document.getElementById('total-pl').textContent = `$${totalPL.toFixed(2)}`;
        document.getElementById('avg-pl').textContent = `$${avgPL.toFixed(2)}`;
        document.getElementById('winning-trades').textContent = winningTrades.length;
        document.getElementById('losing-trades').textContent = losingTrades.length;
        document.getElementById('max-win').textContent = `$${maxWin.toFixed(2)}`;
        document.getElementById('max-loss').textContent = `$${maxLoss.toFixed(2)}`;

        // Color code the total P&L
        const totalPLElement = document.getElementById('total-pl');
        totalPLElement.className = totalPL >= 0 ? 'profit' : 'loss';
    }

    updateStrategyStats() {
        const strategyContainer = document.getElementById('strategy-stats');

        if (this.trades.length === 0) {
            strategyContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No strategy data available</p>';
            return;
        }

        const strategies = {};

        this.trades.forEach(trade => {
            const strategy = trade.strategy || 'No Strategy';
            if (!strategies[strategy]) {
                strategies[strategy] = {
                    trades: 0,
                    totalPL: 0,
                    wins: 0
                };
            }
            strategies[strategy].trades++;
            strategies[strategy].totalPL += trade.profitLoss;
            if (trade.profitLoss > 0) strategies[strategy].wins++;
        });

        const strategyHTML = Object.entries(strategies)
            .sort((a, b) => b[1].totalPL - a[1].totalPL)
            .map(([name, stats]) => `
                <div class="strategy-item">
                    <span><strong>${name}</strong> (${stats.trades} trades)</span>
                    <span class="${stats.totalPL >= 0 ? 'profit' : 'loss'}">
                        $${stats.totalPL.toFixed(2)} (${((stats.wins / stats.trades) * 100).toFixed(1)}% WR)
                    </span>
                </div>
            `).join('');

        strategyContainer.innerHTML = strategyHTML;
    }

    updatePerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        const ctx = canvas.getContext('2d');

        if (this.trades.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#64748b';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
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

        // Clear any existing chart
        if (window.performanceChart) {
            window.performanceChart.destroy();
        }

        window.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative P&L',
                    data: cumulativePL,
                    borderColor: cumulativePL[cumulativePL.length - 1] >= 0 ? '#10b981' : '#ef4444',
                    backgroundColor: cumulativePL[cumulativePL.length - 1] >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
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
                        beginAtZero: false,
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
        const ctx = canvas.getContext('2d');

        if (this.trades.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#64748b';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
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

        // Clear any existing chart
        if (window.monthlyChart) {
            window.monthlyChart.destroy();
        }

        window.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly P&L',
                    data: data,
                    backgroundColor: data.map(value => value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
                    borderColor: data.map(value => value >= 0 ? '#10b981' : '#ef4444'),
                    borderWidth: 1
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
                        beginAtZero: false,
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

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

// Global functions for onclick handlers
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

function exportTrades() {
    const trades = tradeManager.getFilteredAndSortedTrades();

    if (trades.length === 0) {
        tradeManager.showNotification('No trades to export', 'error');
        return;
    }

    // Create CSV content
    const headers = ['Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Position Size', 'Quantity', 'Fees', 'Strategy', 'P&L', 'ROI%', 'Notes'];
    const csvContent = [
        headers.join(','),
        ...trades.map(trade => [
            trade.date,
            trade.symbol,
            trade.tradeType,
            trade.entryPrice,
            trade.exitPrice,
            trade.positionSize,
            trade.quantity,
            trade.fees,
            `"${trade.strategy || ''}"`,
            trade.profitLoss.toFixed(2),
            trade.roi.toFixed(2),
            `"${trade.notes || ''}"`
        ].join(','))
    ].join('\n');

    // Create and download file
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

// Add custom styles for badges
const badgeStyles = document.createElement('style');
badgeStyles.textContent = `
    .badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .badge-buy {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .badge-sell {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
`;
document.head.appendChild(badgeStyles);

// Initialize the trade manager
const tradeManager = new TradeManager();