"use client"

import { useState } from "react"
import type { CryptoCurrency } from "@/lib/coingecko-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, StarOff, Search, TrendingUp, TrendingDown, Settings, ArrowUpDown } from "lucide-react"
import { Sparkline } from "@/components/sparkline"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useMediaQuery } from "@/hooks/use-mobile"

interface CryptoTableProps {
  coins: CryptoCurrency[]
  loading: boolean
  onCoinSelect: (coin: CryptoCurrency) => void
  watchlist: string[]
  onToggleWatchlist: (coinId: string) => void
}

interface ColumnConfig {
  key: keyof CryptoCurrency | "watchlist" | "rank" | "name" | "chart"
  label: string
  defaultVisible: boolean
  mobileVisible: boolean
}

const columns: ColumnConfig[] = [
  { key: "watchlist", label: "Watchlist", defaultVisible: true, mobileVisible: true },
  { key: "rank", label: "Rank", defaultVisible: false, mobileVisible: true },
  { key: "name", label: "Name", defaultVisible: true, mobileVisible: true },
  { key: "current_price", label: "Price", defaultVisible: true, mobileVisible: true },
  { key: "price_change_percentage_24h", label: "24h %", defaultVisible: true, mobileVisible: true },
  { key: "price_change_percentage_7d_in_currency", label: "7d %", defaultVisible: true, mobileVisible: false },
  { key: "market_cap", label: "Market Cap", defaultVisible: false, mobileVisible: false },
  { key: "total_volume", label: "Volume (24h)", defaultVisible: false, mobileVisible: false },
  { key: "chart", label: "7d Chart", defaultVisible: true, mobileVisible: false },
]

export function CryptoTable({ coins, loading, onCoinSelect, watchlist, onToggleWatchlist }: CryptoTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof CryptoCurrency>("market_cap_rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {}),
  )

  const isMobile = useMediaQuery("(max-width: 768px)")

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }))
  }

  const handleSort = (field: keyof CryptoCurrency) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedCoins = coins
    .filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

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

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0
    return (
      <span className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-danger"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(percentage).toFixed(2)}%
      </span>
    )
  }

  const MobileCard = ({ coin }: { coin: CryptoCurrency }) => (
    <Card
      className="mb-3 cursor-pointer hover:bg-surface-light/50 transition-colors"
      onClick={() => onCoinSelect(coin)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleWatchlist(coin.id)
              }}
              className="p-1 h-auto"
            >
              {watchlist.includes(coin.id) ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-muted-foreground">#{coin.market_cap_rank}</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-medium">{formatPrice(coin.current_price)}</div>
            <div className="text-xs">{formatPercentage(coin.price_change_percentage_24h)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{coin.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg md:text-xl">Cryptocurrencies</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            {!isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Table display settings"
                    className="group transition-transform hover:scale-[1.04] active:scale-[0.98]"
                  >
                    <Settings className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Show Columns</h4>
                    {columns.map((column) => (
                      <div key={column.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.key}
                          checked={visibleColumns[column.key]}
                          onCheckedChange={() => toggleColumn(column.key)}
                        />
                        <label htmlFor={column.key} className="text-sm cursor-pointer">
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-2">
            {filteredAndSortedCoins.map((coin) => (
              <MobileCard key={coin.id} coin={coin} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.watchlist && <TableHead className="w-12"></TableHead>}
                  {visibleColumns.rank && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-sm"
                      onClick={() => handleSort("market_cap_rank")}
                    >
                      #
                    </TableHead>
                  )}
                  {visibleColumns.name && <TableHead className="text-sm">Name</TableHead>}
                  {visibleColumns.current_price && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right text-sm"
                      onClick={() => handleSort("current_price")}
                    >
                      <span className="inline-flex items-center justify-end gap-1 w-full">
                        <span>Price</span>
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </TableHead>
                  )}
                  {visibleColumns.price_change_percentage_24h && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right text-sm"
                      onClick={() => handleSort("price_change_percentage_24h")}
                    >
                      <span className="inline-flex items-center justify-end gap-1 w-full">
                        <span>24h %</span>
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </TableHead>
                  )}
                  {visibleColumns.price_change_percentage_7d_in_currency && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right text-sm"
                      onClick={() => handleSort("price_change_percentage_7d_in_currency")}
                    >
                      <span className="inline-flex items-center justify-end gap-1 w-full">
                        <span>7d %</span>
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </TableHead>
                  )}
                  {visibleColumns.market_cap && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right text-sm"
                      onClick={() => handleSort("market_cap")}
                    >
                      Market Cap
                    </TableHead>
                  )}
                  {visibleColumns.total_volume && (
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 text-right text-sm"
                      onClick={() => handleSort("total_volume")}
                    >
                      Volume (24h)
                    </TableHead>
                  )}
                  {visibleColumns.chart && <TableHead className="text-right text-sm">7d Chart</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCoins.map((coin) => (
                  <TableRow
                    key={coin.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onCoinSelect(coin)}
                  >
                    {visibleColumns.watchlist && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleWatchlist(coin.id)
                          }}
                          className="p-1 h-auto"
                        >
                          {watchlist.includes(coin.id) ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                    {visibleColumns.rank && (
                      <TableCell className="font-medium text-sm">{coin.market_cap_rank}</TableCell>
                    )}
                    {visibleColumns.name && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={coin.image || "/placeholder.svg"}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{coin.name}</div>
                            <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.current_price && (
                      <TableCell className="text-right font-mono text-sm">{formatPrice(coin.current_price)}</TableCell>
                    )}
                    {visibleColumns.price_change_percentage_24h && (
                      <TableCell className="text-right text-sm">
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </TableCell>
                    )}
                    {visibleColumns.price_change_percentage_7d_in_currency && (
                      <TableCell className="text-right text-sm">
                        {coin.price_change_percentage_7d_in_currency
                          ? formatPercentage(coin.price_change_percentage_7d_in_currency)
                          : "N/A"}
                      </TableCell>
                    )}
                    {visibleColumns.market_cap && (
                      <TableCell className="text-right font-mono text-sm">{formatMarketCap(coin.market_cap)}</TableCell>
                    )}
                    {visibleColumns.total_volume && (
                      <TableCell className="text-right font-mono text-sm">
                        {formatMarketCap(coin.total_volume)}
                      </TableCell>
                    )}
                    {visibleColumns.chart && (
                      <TableCell className="text-right">
                        <div className="w-24 h-12">
                          <Sparkline
                            data={coin.sparkline_in_7d?.price || []}
                            color={coin.price_change_percentage_7d_in_currency >= 0 ? "#00DC82" : "#FF3B3B"}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
