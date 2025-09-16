"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface PriceChartProps {
  coinId: string
  symbol: string
}

const timeframes = [
  { label: "1D", interval: "1D" },
  { label: "7D", interval: "1D" },
  { label: "30D", interval: "1D" },
  { label: "90D", interval: "1D" },
  { label: "1Y", interval: "1W" },
]

export function PriceChart({ coinId, symbol }: PriceChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7D")
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map common coin symbols to TradingView symbols
  const getTradingViewSymbol = (symbol: string) => {
    const symbolMap: { [key: string]: string } = {
      btc: "BTCUSD",
      eth: "ETHUSD",
      sol: "SOLUSD",
      ada: "ADAUSD",
      dot: "DOTUSD",
      matic: "MATICUSD",
      avax: "AVAXUSD",
      link: "LINKUSD",
      uni: "UNIUSD",
      ltc: "LTCUSD",
      bch: "BCHUSD",
      xlm: "XLMUSD",
      xrp: "XRPUSD",
      doge: "DOGEUSD",
      shib: "SHIBUSD",
    }

    return symbolMap[symbol.toLowerCase()] || `${symbol.toUpperCase()}USD`
  }

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true

    const config = {
      autosize: true,
      symbol: `BINANCE:${getTradingViewSymbol(symbol)}`,
      interval: timeframes.find((tf) => tf.label === selectedTimeframe)?.interval || "1D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(0, 0, 0, 0)",
      gridColor: "rgba(255, 255, 255, 0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    }

    script.innerHTML = JSON.stringify(config)

    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const widgetContent = document.createElement("div")
    widgetContent.className = "tradingview-widget-container__widget"
    widgetContent.style.height = "calc(100% - 32px)"
    widgetContent.style.width = "100%"

    widgetContainer.appendChild(widgetContent)
    widgetContainer.appendChild(script)

    containerRef.current.appendChild(widgetContainer)

    // Set loading to false after a short delay to allow widget to load
    const timer = setTimeout(() => setLoading(false), 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [symbol, selectedTimeframe])

  return (
    <div className="space-y-4">
      <div className="flex gap-1 sm:gap-2 overflow-x-auto">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe.label}
            variant={selectedTimeframe === timeframe.label ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe.label)}
            className="text-xs sm:text-sm flex-shrink-0"
          >
            {timeframe.label}
          </Button>
        ))}
      </div>

      <div className="relative h-96 sm:h-[500px] border rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-sm text-muted-foreground">Loading TradingView chart...</div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
