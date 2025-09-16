"use client"

import { useState, useEffect } from "react"
import { type CryptoCurrency, coinGeckoAPI } from "@/lib/coingecko-api"
import { CryptoTable } from "@/components/crypto-table"
import { TokenDetail } from "@/components/token-detail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X } from "lucide-react"
import { MarketStats } from "@/components/market-stats"
import { TopMovers } from "@/components/top-movers"
import { useMediaQuery } from "@/hooks/use-mobile"

export default function CryptoDashboard() {
  const [coins, setCoins] = useState<CryptoCurrency[]>([])
  const [trending, setTrending] = useState<CryptoCurrency[]>([])
  const [selectedCoin, setSelectedCoin] = useState<CryptoCurrency | null>(null)
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 1024px)")

  useEffect(() => {
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem("crypto-watchlist")
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coinsData, trendingData] = await Promise.all([coinGeckoAPI.getCoins(1, 50), coinGeckoAPI.getTrending()])

        setCoins(coinsData)

        // Get trending market data (single optimized call)
        const trendingIds = trendingData.coins.slice(0, 15).map((coin) => coin.item.id)
        const trendingMarkets = await coinGeckoAPI.getMarketsByIds(trendingIds)
        setTrending(trendingMarkets)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleWatchlist = (coinId: string) => {
    const newWatchlist = watchlist.includes(coinId) ? watchlist.filter((id) => id !== coinId) : [...watchlist, coinId]

    setWatchlist(newWatchlist)
    localStorage.setItem("crypto-watchlist", JSON.stringify(newWatchlist))
  }

  const handleCoinSelect = (coin: CryptoCurrency) => {
    setSelectedCoin(coin)
    setIsDetailSheetOpen(true)
  }

  const getGainersAndLosers = () => {
    const sorted = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    }
  }

  const getWatchlistCoins = () => {
    return coins.filter((coin) => watchlist.includes(coin.id))
  }

  const { gainers, losers } = getGainersAndLosers()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Cryptocurrency Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">Real-time cryptocurrency market data</p>
        </div>

        <div className="relative">
          <div className="space-y-6">
            <MarketStats coins={coins} />

            <TopMovers coins={coins} />

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-4">
                <TabsTrigger value="all" className="text-xs md:text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="trending" className="text-xs md:text-sm">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="gainers" className="text-xs md:text-sm hidden md:block">
                  Gainers
                </TabsTrigger>
                <TabsTrigger value="losers" className="text-xs md:text-sm hidden md:block">
                  Losers
                </TabsTrigger>
                <TabsTrigger value="watchlist" className="text-xs md:text-sm">
                  Watchlist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <CryptoTable
                  coins={coins}
                  loading={loading}
                  onCoinSelect={handleCoinSelect}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </TabsContent>

              <TabsContent value="trending">
                <CryptoTable
                  coins={trending}
                  loading={loading}
                  onCoinSelect={handleCoinSelect}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </TabsContent>

              <TabsContent value="gainers">
                <CryptoTable
                  coins={gainers}
                  loading={loading}
                  onCoinSelect={handleCoinSelect}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </TabsContent>

              <TabsContent value="losers">
                <CryptoTable
                  coins={losers}
                  loading={loading}
                  onCoinSelect={handleCoinSelect}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </TabsContent>

              <TabsContent value="watchlist">
                <CryptoTable
                  coins={getWatchlistCoins()}
                  loading={loading}
                  onCoinSelect={handleCoinSelect}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                />
              </TabsContent>
            </Tabs>
          </div>

          {!isMobile && selectedCoin && (
            <>
              {/* Right sliding panel */}
              <div className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-out shadow-2xl">
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Token Details</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCoin(null)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <TokenDetail coin={selectedCoin} />
                </div>
              </div>
            </>
          )}
        </div>

        {isMobile && (
          <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
            <SheetContent side="bottom" className="h-[85vh] w-full max-w-none overflow-y-auto">
              <SheetHeader className="flex flex-row items-center justify-between pb-4">
                <SheetTitle className="text-xl font-bold">Token Details</SheetTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsDetailSheetOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </SheetHeader>
              {selectedCoin && <TokenDetail coin={selectedCoin} />}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
