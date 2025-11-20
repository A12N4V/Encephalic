/**
 * Electrode Montage Panel - 3D visualization of electrode positions
 */
"use client"

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface ElectrodePosition {
  channel: string
  x: number
  y: number
  z: number
}

interface ElectrodeMontageData {
  positions: ElectrodePosition[]
  selectedChannels?: string[]
}

interface ElectrodeMontageProps {
  data: ElectrodeMontageData | null
  loading: boolean
  onChannelClick?: (channel: string) => void
}

export function ElectrodeMontagePanel({
  data,
  loading,
  onChannelClick
}: ElectrodeMontageProps) {
  const plotData = useMemo(() => {
    if (!data) return []

    // Separate selected and unselected channels
    const selectedPositions = data.positions.filter(p =>
      !data.selectedChannels || data.selectedChannels.includes(p.channel)
    )
    const unselectedPositions = data.positions.filter(p =>
      data.selectedChannels && !data.selectedChannels.includes(p.channel)
    )

    const traces: any[] = []

    // Add brain surface (simplified sphere)
    const u = Array.from({ length: 20 }, (_, i) => i * Math.PI / 19)
    const v = Array.from({ length: 20 }, (_, i) => i * 2 * Math.PI / 19)
    const x: number[][] = []
    const y: number[][] = []
    const z: number[][] = []

    u.forEach((ui) => {
      const xRow: number[] = []
      const yRow: number[] = []
      const zRow: number[] = []
      v.forEach((vi) => {
        xRow.push(Math.sin(ui) * Math.cos(vi))
        yRow.push(Math.sin(ui) * Math.sin(vi))
        zRow.push(Math.cos(ui))
      })
      x.push(xRow)
      y.push(yRow)
      z.push(zRow)
    })

    traces.push({
      type: 'surface',
      x, y, z,
      opacity: 0.2,
      colorscale: [[0, '#e2e8f0'], [1, '#cbd5e1']] as any,
      showscale: false,
      hoverinfo: 'skip',
      name: 'Head Surface'
    })

    // Add selected electrodes
    if (selectedPositions.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: 'markers+text',
        x: selectedPositions.map(p => p.x),
        y: selectedPositions.map(p => p.y),
        z: selectedPositions.map(p => p.z),
        text: selectedPositions.map(p => p.channel),
        textposition: 'top center',
        textfont: {
          size: 9,
          family: 'monospace',
          color: '#3b82f6'
        },
        marker: {
          size: 8,
          color: '#3b82f6',
          symbol: 'circle',
          line: {
            color: '#1e40af',
            width: 2
          }
        },
        name: 'Active Channels',
        hovertemplate: '<b>%{text}</b><br>Position: (%{x:.2f}, %{y:.2f}, %{z:.2f})<extra></extra>'
      })
    }

    // Add unselected electrodes
    if (unselectedPositions.length > 0) {
      traces.push({
        type: 'scatter3d',
        mode: 'markers+text',
        x: unselectedPositions.map(p => p.x),
        y: unselectedPositions.map(p => p.y),
        z: unselectedPositions.map(p => p.z),
        text: unselectedPositions.map(p => p.channel),
        textposition: 'top center',
        textfont: {
          size: 8,
          family: 'monospace',
          color: '#94a3b8'
        },
        marker: {
          size: 6,
          color: '#cbd5e1',
          symbol: 'circle',
          line: {
            color: '#94a3b8',
            width: 1
          }
        },
        name: 'Inactive Channels',
        hovertemplate: '<b>%{text}</b><extra></extra>'
      })
    }

    return traces
  }, [data])

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-950/30 rounded-lg">
              <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Electrode Montage
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                3D electrode positions on scalp
              </p>
            </div>
          </div>
          {data && (
            <Badge variant="secondary" className="text-xs">
              {data.positions.length} electrodes
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading electrode positions...</p>
          </div>
        ) : data ? (
          <div className="space-y-2">
            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
              <Plot
                data={plotData}
                layout={{
                  autosize: true,
                  height: 240,
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  scene: {
                    xaxis: { visible: false, range: [-1.2, 1.2] },
                    yaxis: { visible: false, range: [-1.2, 1.2] },
                    zaxis: { visible: false, range: [-1.2, 1.2] },
                    camera: {
                      eye: { x: 1.5, y: 1.5, z: 1.5 },
                      center: { x: 0, y: 0, z: 0 }
                    },
                    aspectmode: 'cube'
                  },
                  showlegend: true,
                  legend: {
                    x: 0,
                    y: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: 'rgba(148, 163, 184, 0.3)',
                    borderwidth: 1
                  },
                  margin: { t: 0, r: 0, b: 0, l: 0 },
                }}
                useResizeHandler
                style={{ width: '100%' }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ['select2d', 'lasso2d'],
                }}
              />
            </div>

            {/* View Controls Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900 text-xs text-center">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Rotate</p>
                <p className="text-blue-600 dark:text-blue-400">Click + Drag</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900 text-xs text-center">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Zoom</p>
                <p className="text-blue-600 dark:text-blue-400">Scroll</p>
              </div>
            </div>

            {/* Educational Info */}
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
              <p className="font-semibold mb-1">🧠 10-20 System:</p>
              <p>
                Electrodes are positioned using the international 10-20 system,
                with locations named based on brain regions: F (Frontal), C (Central),
                P (Parietal), O (Occipital), T (Temporal). Numbers indicate hemisphere:
                odd = left, even = right, z = midline.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400">
            No electrode data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
