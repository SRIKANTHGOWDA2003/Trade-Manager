'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trades, setTrades] = useState([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDateTrades, setSelectedDateTrades] = useState([])

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

  useEffect(() => {
    if (selectedDate && trades.length > 0) {
      const dayTrades = trades.filter((trade: any) =>
        isSameDay(parseISO(trade.entryDate), selectedDate)
      )
      setSelectedDateTrades(dayTrades)
    }
  }, [selectedDate, trades])

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades')
      const data = await response.json()
      setTrades(data)
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    }
  }

  // Get trades for calendar decoration
  const getTradesForDay = (day: Date) => {
    return trades.filter((trade: any) =>
      isSameDay(parseISO(trade.entryDate), day)
    )
  }

  // Custom day component to show trade indicators
  const modifiers = {
    hasTrades: (day: Date) => getTradesForDay(day).length > 0,
    hasProfitableTrades: (day: Date) => {
      const dayTrades = getTradesForDay(day)
      return dayTrades.some((trade: any) => trade.status === 'CLOSED' && trade.pnl > 0)
    },
    hasLosingTrades: (day: Date) => {
      const dayTrades = getTradesForDay(day)
      return dayTrades.some((trade: any) => trade.status === 'CLOSED' && trade.pnl < 0)
    }
  }

  const modifiersStyles = {
    hasTrades: {
      backgroundColor: '#e0f2fe',
      border: '1px solid #0ea5e9',
      borderRadius: '4px'
    },
    hasProfitableTrades: {
      backgroundColor: '#dcfce7',
      border: '1px solid #22c55e',
      borderRadius: '4px'
    },
    hasLosingTrades: {
      backgroundColor: '#fee2e2',
      border: '1px solid #ef4444',
      borderRadius: '4px'
    }
  }

  // Calculate monthly stats
  const getMonthlyStats = () => {
    if (!selectedDate) return { totalTrades: 0, totalPnL: 0, winRate: 0 }

    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)

    const monthTrades = trades.filter((trade: any) => {
      const tradeDate = parseISO(trade.entryDate)
      return tradeDate >= monthStart && tradeDate <= monthEnd
    })

    const closedTrades = monthTrades.filter((trade: any) => trade.status === 'CLOSED')
    const winningTrades = closedTrades.filter((trade: any) => trade.pnl > 0)
    const totalPnL = closedTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0)
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

    return {
      totalTrades: monthTrades.length,
      totalPnL,
      winRate
    }
  }

  const monthlyStats = getMonthlyStats()

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
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Trade Calendar</h1>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trades</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalTrades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlyStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${monthlyStats.totalPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Calendar</CardTitle>
            <CardDescription>
              Visual overview of your trading activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
                <span className="text-sm">Trade days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                <span className="text-sm">Profitable days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
                <span className="text-sm">Losing days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              Trades for the selected day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateTrades.length === 0 ? (
              <p className="text-muted-foreground">No trades on this day</p>
            ) : (
              <div className="space-y-4">
                {selectedDateTrades.map((trade: any) => (
                  <div key={trade.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{trade.symbol}</h3>
                        <p className="text-sm text-muted-foreground">
                          {trade.type} @ ${trade.entryPrice} × {trade.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                          {trade.type}
                        </Badge>
                        <Badge variant={trade.status === 'OPEN' ? 'outline' : 'default'}>
                          {trade.status}
                        </Badge>
                      </div>
                    </div>

                    {trade.status === 'CLOSED' && trade.pnl && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">P&L:</span>
                          <span className={`font-semibold ${
                            trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${trade.pnl.toFixed(2)}
                          </span>
                        </div>
                        {trade.roi && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm">ROI:</span>
                            <span className={`text-sm ${
                              trade.roi >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(trade.roi * 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {trade.strategy && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground">Strategy: {trade.strategy}</span>
                      </div>
                    )}

                    {trade.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">{trade.notes}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Day Summary */}
                {selectedDateTrades.length > 1 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Day Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Trades: </span>
                        <span className="font-medium">{selectedDateTrades.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Day P&L: </span>
                        <span className={`font-medium ${
                          selectedDateTrades
                            .filter((t: any) => t.status === 'CLOSED')
                            .reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) >= 0
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${selectedDateTrades
                            .filter((t: any) => t.status === 'CLOSED')
                            .reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}