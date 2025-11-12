'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function TradesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trades, setTrades] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY')
  const [entryPrice, setEntryPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [strategy, setStrategy] = useState('')

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
    } catch (error) {
      toast.error('Failed to fetch trades')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          type,
          entryPrice,
          quantity,
          entryDate,
          notes,
          strategy,
        }),
      })

      if (response.ok) {
        toast.success('Trade added successfully')
        // Reset form
        setSymbol('')
        setEntryPrice('')
        setQuantity('')
        setEntryDate('')
        setNotes('')
        setStrategy('')
        // Refresh trades
        fetchTrades()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add trade')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  const openTrades = trades.filter((trade: any) => trade.status === 'OPEN')
  const closedTrades = trades.filter((trade: any) => trade.status === 'CLOSED')
  const totalPnL = closedTrades.reduce((sum: number, trade: any) => sum + (trade.pnl || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trade Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTrades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Trades</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedTrades.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add-trade" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add-trade">Add Trade</TabsTrigger>
          <TabsTrigger value="open-trades">Open Trades</TabsTrigger>
          <TabsTrigger value="closed-trades">Closed Trades</TabsTrigger>
        </TabsList>

        <TabsContent value="add-trade">
          <Card>
            <CardHeader>
              <CardTitle>Add New Trade</CardTitle>
              <CardDescription>
                Enter the details of your new trade position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., AAPL, BTCUSDT"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Trade Type</Label>
                    <Select value={type} onValueChange={(value: 'BUY' | 'SELL') => setType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">Buy (Long)</SelectItem>
                        <SelectItem value="SELL">Sell (Short)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryPrice">Entry Price</Label>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryDate">Entry Date</Label>
                    <Input
                      id="entryDate"
                      type="datetime-local"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strategy">Strategy (Optional)</Label>
                    <Input
                      id="strategy"
                      placeholder="e.g., Scalping, Swing Trading"
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Add any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding Trade...' : 'Add Trade'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open-trades">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
              <CardDescription>Currently active trades</CardDescription>
            </CardHeader>
            <CardContent>
              {openTrades.length === 0 ? (
                <p className="text-muted-foreground">No open trades</p>
              ) : (
                <div className="space-y-4">
                  {openTrades.map((trade: any) => (
                    <div key={trade.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{trade.symbol}</h3>
                          <p className="text-sm text-muted-foreground">
                            {trade.type} @ ${trade.entryPrice} × {trade.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Entered: {new Date(trade.entryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed-trades">
          <Card>
            <CardHeader>
              <CardTitle>Closed Trades</CardTitle>
              <CardDescription>Completed trades with P&L</CardDescription>
            </CardHeader>
            <CardContent>
              {closedTrades.length === 0 ? (
                <p className="text-muted-foreground">No closed trades</p>
              ) : (
                <div className="space-y-4">
                  {closedTrades.map((trade: any) => (
                    <div key={trade.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{trade.symbol}</h3>
                          <p className="text-sm text-muted-foreground">
                            {trade.type} @ ${trade.entryPrice} → ${trade.exitPrice} × {trade.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trade.entryDate).toLocaleDateString()} - {new Date(trade.exitDate!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            (trade.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${(trade.pnl || 0).toFixed(2)}
                          </div>
                          <div className={`text-xs ${
                            (trade.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {((trade.roi || 0) * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}