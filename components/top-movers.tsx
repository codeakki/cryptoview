"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react"
import type { CryptoCurrency } from "@/lib/coingecko-api"
import { Sparkline } from "./sparkline"

interface TopMoversProps {
  coins: CryptoCurrency[]
}

export function TopMovers({ coins }: TopMoversProps) {
  const getTopMovers = () => {
    const gainers = coins
      .filter((coin) => coin.price_change_percentage_24h > 0)
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5)

    const losers = coins
      .filter((coin) => coin.price_change_percentage_24h < 0)
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 5)

    return { gainers, losers }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const { gainers, losers } = getTopMovers()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Gainers */}
      <Card className="bg-surface border-surface">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gainers.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-medium text-white">{coin.name}</p>
                    <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-10">
                    <Sparkline data={coin.sparkline_in_7d.price} color="#00DC82" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(coin.current_price)}</p>
                    <p className="text-success flex items-center gap-1">
                      <ArrowUp className="h-4 w-4" />+{coin.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Losers */}
      <Card className="bg-surface border-surface">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-danger" />
            Top Losers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {losers.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-medium text-white">{coin.name}</p>
                    <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-10">
                    <Sparkline data={coin.sparkline_in_7d.price} color="#FF3B3B" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(coin.current_price)}</p>
                    <p className="text-danger flex items-center gap-1">
                      <ArrowDown className="h-4 w-4" />
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </p>
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
