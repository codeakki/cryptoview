"use client"

import { useState, useEffect } from "react"
import type { CryptoCurrency } from "@/lib/coingecko-api"
import { coinGeckoAPI } from "@/lib/coingecko-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3, Globe, RefreshCw } from "lucide-react"
import { PriceChart } from "@/components/price-chart"

interface TokenDetailProps {
  coin: CryptoCurrency
}

interface CoinDetail {
  id: string
  name: string
  symbol: string
  description: { en: string }
  image: { large: string }
  market_data: {
    current_price: { usd: number }
    ath: { usd: number }
    ath_date: { usd: string }
    atl: { usd: number }
    atl_date: { usd: string }
    market_cap: { usd: number }
    fully_diluted_valuation: { usd: number }
    total_volume: { usd: number }
    high_24h: { usd: number }
    low_24h: { usd: number }
    price_change_24h: number
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    market_cap_rank: number
    circulating_supply: number
    total_supply: number
    max_supply: number
    market_cap_change_percentage_24h: number
  }
  links: {
    homepage: string[]
    blockchain_site: string[]
  }
}

export function TokenDetail({ coin }: TokenDetailProps) {
  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCoinDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const detail = await coinGeckoAPI.getCoinById(coin.id)
      setCoinDetail(detail)
    } catch (error) {
      console.error("Error fetching coin detail:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch coin details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoinDetail()
  }, [coin.id])

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toLocaleString()}`
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`
    return supply.toLocaleString()
  }

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(percentage).toFixed(2)}%
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getSupplyPercentage = () => {
    if (!coinDetail?.market_data.circulating_supply || !coinDetail?.market_data.max_supply) return 0
    return (coinDetail.market_data.circulating_supply / coinDetail.market_data.max_supply) * 100
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-muted rounded-full animate-pulse" />
            <div>
              <div className="h-4 sm:h-6 w-24 sm:w-32 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 sm:h-4 w-12 sm:w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 sm:h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !coinDetail) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">{error || "Failed to load token details"}</p>
            {error && <p className="text-xs text-danger mt-2">Error: {error}</p>}
            <Button onClick={fetchCoinDetail} variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={coinDetail.image.large || "/placeholder.svg"}
              alt={coinDetail.name}
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-2xl truncate">{coinDetail.name}</CardTitle>
              <p className="text-muted-foreground uppercase text-sm">{coinDetail.symbol}</p>
            </div>
            <div className="text-xs sm:text-sm">
              Rank #{coinDetail.market_data.market_cap_rank}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl sm:text-3xl font-bold font-mono">
                {formatPrice(coinDetail.market_data.current_price.usd)}
              </p>
              <div className="flex items-center gap-2">
                {formatPercentage(coinDetail.market_data.price_change_percentage_24h)}
                <span className="text-sm text-muted-foreground">24h</span>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">24h Range</span>
                <span className="font-mono">
                  {formatPrice(coinDetail.market_data.low_24h.usd)} - {formatPrice(coinDetail.market_data.high_24h.usd)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">All-Time High</span>
                <div className="text-right">
                  <p className="font-mono">{formatPrice(coinDetail.market_data.ath.usd)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(coinDetail.market_data.ath_date.usd)}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">All-Time Low</span>
                <div className="text-right">
                  <p className="font-mono">{formatPrice(coinDetail.market_data.atl.usd)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(coinDetail.market_data.atl_date.usd)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Market Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-mono">{formatMarketCap(coinDetail.market_data.market_cap.usd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Volume</span>
                      <span className="font-mono">{formatMarketCap(coinDetail.market_data.total_volume.usd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fully Diluted Valuation</span>
                      <span className="font-mono">
                        {coinDetail.market_data.fully_diluted_valuation?.usd
                          ? formatMarketCap(coinDetail.market_data.fully_diluted_valuation.usd)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Circulating Supply</span>
                      <span className="font-mono">
                        {coinDetail.market_data.circulating_supply
                          ? formatSupply(coinDetail.market_data.circulating_supply)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Supply</span>
                      <span className="font-mono">
                        {coinDetail.market_data.total_supply
                          ? formatSupply(coinDetail.market_data.total_supply)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Supply</span>
                      <span className="font-mono">
                        {coinDetail.market_data.max_supply ? formatSupply(coinDetail.market_data.max_supply) : "∞"}
                      </span>
                    </div>
                  </div>
                </div>

                {coinDetail.market_data.max_supply && (
                  <div className="mt-6">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Supply Progress</span>
                      <span className="font-mono">{getSupplyPercentage().toFixed(1)}%</span>
                    </div>
                    <Progress value={getSupplyPercentage()} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Price Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart coinId={coin.id} symbol={coinDetail.symbol} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Price Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">24h Change</p>
                  <div className="text-base sm:text-lg font-semibold">
                    {formatPercentage(coinDetail.market_data.price_change_percentage_24h)}
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">7d Change</p>
                  <div className="text-base sm:text-lg font-semibold">
                    {coinDetail.market_data.price_change_percentage_7d
                      ? formatPercentage(coinDetail.market_data.price_change_percentage_7d)
                      : "N/A"}
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">30d Change</p>
                  <div className="text-base sm:text-lg font-semibold">
                    {coinDetail.market_data.price_change_percentage_30d
                      ? formatPercentage(coinDetail.market_data.price_change_percentage_30d)
                      : "N/A"}
                  </div>
                </div>
              </div>

              {coinDetail.links.homepage[0] && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Globe className="h-4 w-4" />
                    Links
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={coinDetail.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      Official Website
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
