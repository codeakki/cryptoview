"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react"
import { type CryptoCurrency, type GlobalMarketData, coinGeckoAPI } from "@/lib/coingecko-api"
import { Sparkline } from "./sparkline"

interface MarketInsightsProps {
  coins: CryptoCurrency[]
}

export function MarketInsights({ coins }: MarketInsightsProps) {
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const data = await coinGeckoAPI.getGlobalMarketData()
        setGlobalData(data)
      } catch (error) {
        console.error("Error fetching global market data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGlobalData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchGlobalData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getTopMovers = () => {
    const sorted = [...coins].sort(
      (a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h),
    )
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

  const getMarketSentiment = () => {
    const upCoins = coins.filter((coin) => coin.price_change_percentage_24h > 0).length
    const downCoins = coins.filter((coin) => coin.price_change_percentage_24h < 0).length
    const totalCoins = upCoins + downCoins

    return {
      upCoins,
      downCoins,
      upPercentage: totalCoins > 0 ? (upCoins / totalCoins) * 100 : 0,
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const { gainers, losers } = getTopMovers()
  const sentiment = getMarketSentiment()

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-surface border-surface">
          <CardHeader>
            <CardTitle className="text-white">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Market Overview Stats */}
      <Card className="bg-surface border-surface">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {globalData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Market Cap</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(globalData.total_market_cap.usd)}</p>
                <p
                  className={`text-xs ${globalData.market_cap_change_percentage_24h_usd >= 0 ? "text-success" : "text-danger"}`}
                >
                  {globalData.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}
                  {globalData.market_cap_change_percentage_24h_usd.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">24h Volume</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(globalData.total_volume.usd)}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-400 mb-2">Market Sentiment</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-success" />
                <span className="text-success font-medium">{sentiment.upCoins}</span>
                <span className="text-gray-400 text-sm">up</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDown className="h-4 w-4 text-danger" />
                <span className="text-danger font-medium">{sentiment.downCoins}</span>
                <span className="text-gray-400 text-sm">down</span>
              </div>
              <Badge variant={sentiment.upPercentage > 50 ? "default" : "destructive"} className="ml-auto">
                {sentiment.upPercentage.toFixed(0)}% Bullish
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div key={coin.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <div>
                    <p className="font-medium text-white text-sm">{coin.name}</p>
                    <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8">
                    <Sparkline data={coin.sparkline_in_7d.price} color="#00DC82" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(coin.current_price)}</p>
                    <p className="text-xs text-success flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />+{coin.price_change_percentage_24h.toFixed(2)}%
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
              <div key={coin.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <div>
                    <p className="font-medium text-white text-sm">{coin.name}</p>
                    <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8">
                    <Sparkline data={coin.sparkline_in_7d.price} color="#FF3B3B" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(coin.current_price)}</p>
                    <p className="text-xs text-danger flex items-center gap-1">
                      <ArrowDown className="h-3 w-3" />
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
