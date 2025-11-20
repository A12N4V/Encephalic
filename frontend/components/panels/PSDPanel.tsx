/**
 * Power Spectral Density Panel - Frequency domain analysis
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Waves } from 'lucide-react'
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
          color: '#a855f7',
          width: 2,
        },
        fill: 'tozeroy' as const,
        fillcolor: 'rgba(168, 85, 247, 0.2)',
      },
    ]
  }, [data])

  return (
    <Card className="bg-black border-purple-500/30 h-full">
      <CardHeader className="border-b border-purple-500/30 pb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-purple-500" />
          <CardTitle className="text-purple-500 text-sm font-mono uppercase tracking-wider">
            Power Spectral Density
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-purple-500 font-mono text-xs animate-pulse">
              &gt; COMPUTING PSD...
            </div>
          </div>
        ) : (
          <div className="bg-black/50 border border-purple-500/20 rounded p-2">
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                height: 300,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0.3)',
                xaxis: {
                  title: { text: 'Frequency (Hz)', font: { color: '#a855f7', size: 10 } },
                  color: '#a855f7',
                  gridcolor: '#a855f733',
                  showline: true,
                  linecolor: '#a855f7',
                },
                yaxis: {
                  title: { text: 'Power (µV²/Hz)', font: { color: '#a855f7', size: 10 } },
                  type: 'log',
                  color: '#a855f7',
                  gridcolor: '#a855f733',
                  showline: true,
                  linecolor: '#a855f7',
                },
                font: {
                  color: '#a855f7',
                  family: 'monospace',
                  size: 9,
                },
                margin: { t: 10, r: 20, b: 40, l: 60 },
              }}
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
