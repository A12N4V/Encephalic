/**
 * Power Spectral Density Panel - Frequency domain analysis
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Waves, Loader2 } from 'lucide-react'
import { PSDData } from '@/hooks/useEEGData'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface PSDPanelProps {
  data: PSDData | null
  loading: boolean
}

export function PSDPanel({ data, loading }: PSDPanelProps) {
  const plotData = useMemo(() => {
    if (!data) return []

    return [
      {
        x: data.frequencies,
        y: data.psd,
        mode: 'lines' as const,
        name: 'Average PSD',
        line: {
          color: '#8b5cf6',
          width: 2.5,
        },
        fill: 'tozeroy' as const,
        fillcolor: 'rgba(139, 92, 246, 0.15)',
      },
    ]
  }, [data])

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-950/30 rounded-lg">
            <Waves className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Power Spectral Density
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Frequency domain power distribution
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Computing power spectrum...</p>
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
                    text: 'Frequency (Hz)',
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
                    text: 'Power (µV²/Hz)',
                    font: {
                      color: 'rgb(100, 116, 139)',
                      size: 12,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  type: 'log',
                  color: 'rgb(148, 163, 184)',
                  gridcolor: 'rgba(148, 163, 184, 0.2)',
                  showline: true,
                  linecolor: 'rgba(148, 163, 184, 0.3)',
                },
                font: {
                  color: 'rgb(100, 116, 139)',
                  family: 'Inter, system-ui, sans-serif',
                  size: 11,
                },
                margin: { t: 10, r: 30, b: 50, l: 70 },
                hovermode: 'closest',
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
