/**
 * Spectrogram Panel - Time-frequency analysis visualization
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface SpectrogramData {
  times: number[]
  frequencies: number[]
  power: number[][]
  channel: string
}

interface SpectrogramPanelProps {
  data: SpectrogramData | null
  loading: boolean
}

export function SpectrogramPanel({ data, loading }: SpectrogramPanelProps) {
  const plotData = useMemo(() => {
    if (!data) return []

    return [{
      type: 'heatmap' as const,
      x: data.times,
      y: data.frequencies,
      z: data.power,
      colorscale: 'Jet',
      colorbar: {
        title: {
          text: 'Power (dB)',
          side: 'right' as const
        },
        thickness: 15,
        len: 0.7
      }
    }]
  }, [data])

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-950/30 rounded-lg">
              <Activity className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Time-Frequency Analysis
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Spectrogram - Wavelet decomposition
              </p>
            </div>
          </div>
          {data && (
            <Badge variant="secondary" className="text-xs font-mono">
              {data.channel}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <Loader2 className="w-8 h-8 text-pink-600 dark:text-pink-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Computing spectrogram...</p>
          </div>
        ) : data ? (
          <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                height: 400,
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
                },
                yaxis: {
                  title: {
                    text: 'Frequency (Hz)',
                    font: {
                      color: 'rgb(100, 116, 139)',
                      size: 12,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  color: 'rgb(148, 163, 184)',
                  gridcolor: 'rgba(148, 163, 184, 0.2)',
                },
                font: {
                  color: 'rgb(100, 116, 139)',
                  family: 'Inter, system-ui, sans-serif',
                  size: 11,
                },
                margin: { t: 10, r: 80, b: 50, l: 60 },
              }}
              useResizeHandler
              style={{ width: '100%' }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
              }}
            />

            {/* Educational Info */}
            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <p className="font-semibold mb-1">📊 Spectrogram Interpretation:</p>
              <p>
                This visualization shows how frequency content changes over time.
                Brighter colors indicate higher power at that frequency and time point.
                Look for vertical bands (transient events) or horizontal bands (sustained oscillations).
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-slate-400">
            No spectrogram data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
