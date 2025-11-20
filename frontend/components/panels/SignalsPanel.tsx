/**
 * EEG Signals Panel - Modern time-series visualization
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Loader2 } from 'lucide-react'
import { EEGData } from '@/hooks/useEEGData'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface SignalsPanelProps {
  data: EEGData | null
  loading: boolean
  onTimeClick?: (time: number) => void
}

// Modern color palette for channels
const CHANNEL_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#a855f7', // Violet
]

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
        width: 1.5,
        color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
      },
    }))
  }, [data])

  const handleClick = (event: any) => {
    if (event.points && event.points[0] && onTimeClick) {
      onTimeClick(event.points[0].x)
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Neural Signal Activity
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time EEG waveform visualization
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading signal data...</p>
          </div>
        ) : (
          <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                height: 240,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                xaxis: {
                  title: {
                    text: 'Time (seconds)',
                    font: {
                      color: 'rgb(100, 116, 139)',
                      size: 12,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  color: 'rgb(148, 163, 184)',
                  gridcolor: 'rgba(148, 163, 184, 0.2)',
                  showline: true,
                  linecolor: 'rgba(148, 163, 184, 0.3)',
                  zeroline: false,
                },
                yaxis: {
                  title: {
                    text: 'Amplitude (µV)',
                    font: {
                      color: 'rgb(100, 116, 139)',
                      size: 12,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  color: 'rgb(148, 163, 184)',
                  gridcolor: 'rgba(148, 163, 184, 0.2)',
                  showline: true,
                  linecolor: 'rgba(148, 163, 184, 0.3)',
                  zeroline: true,
                  zerolinecolor: 'rgba(148, 163, 184, 0.4)',
                },
                font: {
                  color: 'rgb(100, 116, 139)',
                  family: 'Inter, system-ui, sans-serif',
                  size: 11,
                },
                legend: {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  bordercolor: 'rgba(148, 163, 184, 0.3)',
                  borderwidth: 1,
                  font: {
                    color: 'rgb(71, 85, 105)',
                    size: 10,
                    family: 'Inter, system-ui, sans-serif'
                  },
                  x: 1.02,
                  y: 1,
                },
                margin: { t: 10, r: 130, b: 50, l: 60 },
                hovermode: 'closest',
              }}
              onClick={handleClick}
              useResizeHandler
              style={{ width: '100%' }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
