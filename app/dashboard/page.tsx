'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Plus,
} from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trades, setTrades] = useState([])
  const [analytics, setAnalytics] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalPnL: 0,
    totalROI: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchTrades()
    }
  }, [session])

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades')
      const data = await response.json()
      setTrades(data)
      calculateAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    }
  }

  const calculateAnalytics = (tradeData: any[]) => {
    const closedTrades = tradeData.filter(trade => trade.status === 'CLOSED' && trade.pnl !== null)
    const winningTrades = closedTrades.filter(trade => trade.pnl > 0)
    const losingTrades = closedTrades.filter(trade => trade.pnl < 0)

    const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0))

    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0

    // Simple Sharpe ratio calculation (assuming 2% risk-free rate annually)
    const returns = closedTrades.map(trade => trade.roi || 0)
    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0
    const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length : 0
    const sharpeRatio = variance > 0 ? (avgReturn - 0.02) / Math.sqrt(variance) : 0

    setAnalytics({
      totalTrades: tradeData.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPnL,
      totalROI: closedTrades.length > 0 ? (totalPnL / (closedTrades.reduce((sum, trade) => sum + (trade.entryPrice * trade.quantity), 0) / closedTrades.length)) * 100 : 0,
      avgWin,
      avgLoss,
      profitFactor,
      maxDrawdown: 0, // Simplified - would need more complex calculation
      sharpeRatio,
    })
  }

  // Chart data preparation
  const pnlData = trades
    .filter(trade => trade.status === 'CLOSED' && trade.exitDate)
    .sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime())
    .map(trade => ({
      date: new Date(trade.exitDate).toLocaleDateString(),
      pnl: trade.pnl,
      cumulative: trades
        .filter(t => t.status === 'CLOSED' && new Date(t.exitDate) <= new Date(trade.exitDate))
        .reduce((sum, t) => sum + t.pnl, 0)
    }))

  const monthlyPnL = trades
    .filter(trade => trade.status === 'CLOSED' && trade.exitDate)
    .reduce((acc: any[], trade) => {
      const month = new Date(trade.exitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      const existing = acc.find(item => item.month === month)
      if (existing) {
        existing.pnl += trade.pnl
      } else {
        acc.push({ month, pnl: trade.pnl })
      }
      return acc
    }, [])

  const symbolDistribution = trades.reduce((acc: any[], trade) => {
    const existing = acc.find(item => item.symbol === trade.symbol)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ symbol: trade.symbol, count: 1 })
    }
    return acc
  }, [])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>
        <Link href="/trades">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analytics.totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalROI.toFixed(2)}% ROI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.winningTrades}W / {analytics.losingTrades}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.profitFactor === Infinity ? '∞' : analytics.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg Win: ${analytics.avgWin.toFixed(2)} / Avg Loss: ${analytics.avgLoss.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monthly">Monthly P&L</TabsTrigger>
          <TabsTrigger value="symbols">Symbol Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative P&L</CardTitle>
              <CardDescription>
                Your trading performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pnlData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'P&L']} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly P&L</CardTitle>
              <CardDescription>
                Your profit and loss by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPnL}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'P&L']} />
                  <Bar dataKey="pnl" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symbols">
          <Card>
            <CardHeader>
              <CardTitle>Symbol Distribution</CardTitle>
              <CardDescription>
                Trades by symbol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={symbolDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ symbol, count }) => `${symbol}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {symbolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>
            Your latest trading activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trades.slice(0, 5).map((trade: any) => (
              <div key={trade.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-semibold">{trade.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {trade.type} @ ${trade.entryPrice} × {trade.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    trade.status === 'CLOSED' && trade.pnl ? (trade.pnl >= 0 ? 'text-green-600' : 'text-red-600') : ''
                  }`}>
                    {trade.status === 'CLOSED' ? `$${trade.pnl?.toFixed(2) || '0.00'}` : 'Open'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.entryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}