/**
 * Connectivity Panel - Channel coherence and correlation analysis
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Network, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface ConnectivityData {
  channels: string[]
  correlationMatrix: number[][]
  coherenceMatrix?: number[][]
}

interface ConnectivityPanelProps {
  data: ConnectivityData | null
  loading: boolean
  analysisType?: 'correlation' | 'coherence'
}

export function ConnectivityPanel({
  data,
  loading,
  analysisType = 'correlation'
}: ConnectivityPanelProps) {
  const plotData = useMemo(() => {
    if (!data) return []

    const matrix = analysisType === 'correlation'
      ? data.correlationMatrix
      : data.coherenceMatrix || data.correlationMatrix

    return [{
      type: 'heatmap' as const,
      x: data.channels,
      y: data.channels,
      z: matrix,
      colorscale: [
        [0, '#1e3a8a'],
        [0.5, '#f8fafc'],
        [1, '#dc2626']
      ] as any,
      zmid: 0,
      colorbar: {
        title: {
          text: analysisType === 'correlation' ? 'Correlation' : 'Coherence',
          side: 'right'
        },
        thickness: 15,
        len: 0.7
      },
      hovertemplate: '%{x} ↔ %{y}<br>Value: %{z:.3f}<extra></extra>'
    }]
  }, [data, analysisType])

  // Calculate strongest connections
  const topConnections = useMemo(() => {
    if (!data) return []

    const matrix = analysisType === 'correlation'
      ? data.correlationMatrix
      : data.coherenceMatrix || data.correlationMatrix

    const connections: Array<{ch1: string, ch2: string, value: number}> = []

    for (let i = 0; i < data.channels.length; i++) {
      for (let j = i + 1; j < data.channels.length; j++) {
        connections.push({
          ch1: data.channels[i],
          ch2: data.channels[j],
          value: Math.abs(matrix[i][j])
        })
      }
    }

    return connections.sort((a, b) => b.value - a.value).slice(0, 5)
  }, [data, analysisType])

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-950/30 rounded-lg">
              <Network className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Connectivity Analysis
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inter-channel {analysisType}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs capitalize">
            {analysisType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <Loader2 className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Computing connectivity...</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <Plot
                data={plotData}
                layout={{
                  autosize: true,
                  height: 400,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    tickangle: -45,
                    color: 'rgb(148, 163, 184)',
                    tickfont: {
                      size: 10,
                      family: 'monospace'
                    }
                  },
                  yaxis: {
                    color: 'rgb(148, 163, 184)',
                    tickfont: {
                      size: 10,
                      family: 'monospace'
                    }
                  },
                  font: {
                    color: 'rgb(100, 116, 139)',
                    family: 'Inter, system-ui, sans-serif',
                    size: 11,
                  },
                  margin: { t: 10, r: 80, b: 80, l: 60 },
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

            {/* Top Connections */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Strongest Connections
              </h4>
              <div className="space-y-2">
                {topConnections.map((conn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {conn.ch1}
                      </Badge>
                      <span className="text-xs text-slate-400">↔</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {conn.ch2}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${conn.value * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                        {conn.value.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational Info */}
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="font-semibold mb-1">🔗 Connectivity Explained:</p>
              <p>
                {analysisType === 'correlation'
                  ? 'Correlation measures linear relationships between channel signals. High values indicate synchronized activity.'
                  : 'Coherence measures frequency-domain correlation. It reveals functional connectivity between brain regions.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-slate-400">
            No connectivity data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
