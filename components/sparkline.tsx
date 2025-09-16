"use client"

interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

export function Sparkline({ data, color, width = 96, height = 48 }: SparklineProps) {
  if (!data || data.length === 0) {
    return <div className="w-full h-full bg-muted/20 rounded" />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  if (range === 0) {
    return <div className="w-full h-full bg-muted/20 rounded" />
  }

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="w-full h-full">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  )
}
