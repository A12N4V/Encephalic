/**
 * EEG Signals Panel - Terminal-style time-series visualization
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { EEGData } from '@/hooks/useEEGData'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface SignalsPanelProps {
  data: EEGData | null
  loading: boolean
  onTimeClick?: (time: number) => void
}

export function SignalsPanel({ data, loading, onTimeClick }: SignalsPanelProps) {
  // Memoize plot data to prevent unnecessary re-renders
  const plotData = useMemo(() => {
    if (!data) return []

    return data.labels.slice(0, 10).map((label, index) => ({
      x: data.times,
      y: data.data[index],
      mode: 'lines' as const,
      name: label,
      line: {
        width: 1,
        color: `hsl(0, 0%, ${100 - index * 8}%)`,
      },
    }))
  }, [data])

  const handleClick = (event: any) => {
    if (event.points && event.points[0] && onTimeClick) {
      onTimeClick(event.points[0].x)
    }
  }

  return (
    <Card className="bg-black border-green-500/30 h-full">
      <CardHeader className="border-b border-green-500/30 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" />
          <CardTitle className="text-green-500 text-sm font-mono uppercase tracking-wider">
            Neural Signals [LIVE]
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-green-500 font-mono text-xs animate-pulse">
              &gt; LOADING EEG DATA...
            </div>
          </div>
        ) : (
          <div className="bg-black/50 border border-green-500/20 rounded p-2">
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                height: 300,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0.3)',
                xaxis: {
                  title: { text: 'Time (s)', font: { color: '#22c55e', size: 10 } },
                  color: '#22c55e',
                  gridcolor: '#22c55e33',
                  showline: true,
                  linecolor: '#22c55e',
                },
                yaxis: {
                  title: { text: 'Amplitude (µV)', font: { color: '#22c55e', size: 10 } },
                  color: '#22c55e',
                  gridcolor: '#22c55e33',
                  showline: true,
                  linecolor: '#22c55e',
                },
                font: {
                  color: '#22c55e',
                  family: 'monospace',
                  size: 9,
                },
                legend: {
                  bgcolor: 'rgba(0,0,0,0.8)',
                  bordercolor: '#22c55e',
                  borderwidth: 1,
                  font: { color: '#22c55e', size: 8 },
                  x: 1.02,
                  y: 1,
                },
                margin: { t: 10, r: 120, b: 40, l: 50 },
              }}
              onClick={handleClick}
              useResizeHandler
              style={{ width: '100%' }}
              config={{
                responsive: true,
                displayModeBar: false,
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
