"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"
import { type CryptoCurrency, type GlobalMarketData, coinGeckoAPI } from "@/lib/coingecko-api"

interface MarketStatsProps {
  coins: CryptoCurrency[]
}

export function MarketStats({ coins }: MarketStatsProps) {
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
    const interval = setInterval(fetchGlobalData, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const sentiment = getMarketSentiment()

  if (loading) {
    return (
      <Card className="bg-surface border-surface">
        <CardContent className="p-6">
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-surface border-surface">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Market Cap */}
          {globalData && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Market Cap</p>
              <p className="text-xl font-bold text-white mb-1">{formatCurrency(globalData.total_market_cap.usd)}</p>
              <p
                className={`text-sm ${globalData.market_cap_change_percentage_24h_usd >= 0 ? "text-success" : "text-danger"}`}
              >
                {globalData.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}
                {globalData.market_cap_change_percentage_24h_usd.toFixed(2)}%
              </p>
            </div>
          )}

          {/* 24h Volume */}
          {globalData && (
            <div>
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-xl font-bold text-white">{formatCurrency(globalData.total_volume.usd)}</p>
            </div>
          )}

          {/* Market Sentiment */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Market Sentiment</p>
            <div className="flex items-center gap-2 mb-1">
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
            </div>
            <Badge variant={sentiment.upPercentage > 50 ? "default" : "destructive"}>
              {sentiment.upPercentage.toFixed(0)}% Bullish
            </Badge>
          </div>

          {/* Bitcoin Dominance */}
          {globalData && (
            <div>
              <p className="text-sm text-gray-400 mb-1">BTC Dominance</p>
              <p className="text-xl font-bold text-white">{globalData.market_cap_percentage.btc.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
