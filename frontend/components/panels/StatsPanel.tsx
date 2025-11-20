/**
 * Statistics Panel - Comprehensive signal metrics and quality indicators
 */
"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Activity, Zap, Loader2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ChannelStats {
  channel: string
  mean: number
  std: number
  min: number
  max: number
  rms: number
  peakToPeak: number
  snr: number
}

interface StatsPanelProps {
  data: {
    times: number[]
    data: number[][]
    labels: string[]
  } | null
  loading: boolean
}

export function StatsPanel({ data, loading }: StatsPanelProps) {
  const channelStats = useMemo(() => {
    if (!data) return []

    return data.labels.map((label, idx) => {
      const channelData = data.data[idx]
      const mean = channelData.reduce((a, b) => a + b, 0) / channelData.length
      const std = Math.sqrt(
        channelData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          channelData.length
      )
      const min = Math.min(...channelData)
      const max = Math.max(...channelData)
      const rms = Math.sqrt(
        channelData.reduce((sum, val) => sum + val * val, 0) / channelData.length
      )
      const peakToPeak = max - min

      // Simple SNR estimate (signal power / noise power)
      const signalPower = rms * rms
      const noisePower = std * std
      const snr = signalPower / noisePower

      return {
        channel: label,
        mean,
        std,
        min,
        max,
        rms,
        peakToPeak,
        snr
      } as ChannelStats
    })
  }, [data])

  const overallStats = useMemo(() => {
    if (channelStats.length === 0) return null

    return {
      avgRMS: channelStats.reduce((sum, s) => sum + s.rms, 0) / channelStats.length,
      avgSNR: channelStats.reduce((sum, s) => sum + s.snr, 0) / channelStats.length,
      avgPeakToPeak: channelStats.reduce((sum, s) => sum + s.peakToPeak, 0) / channelStats.length,
      totalChannels: channelStats.length
    }
  }, [channelStats])

  const getQualityBadge = (snr: number) => {
    if (snr > 10) return { label: 'Excellent', color: 'bg-emerald-500' }
    if (snr > 5) return { label: 'Good', color: 'bg-blue-500' }
    if (snr > 2) return { label: 'Fair', color: 'bg-yellow-500' }
    return { label: 'Poor', color: 'bg-red-500' }
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Signal Statistics
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive metrics and quality indicators
              </p>
            </div>
          </div>
          {overallStats && (
            <Badge variant="secondary" className="text-xs">
              {overallStats.totalChannels} channels
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Analyzing signal data...</p>
          </div>
        ) : data && overallStats ? (
          <div className="space-y-4">
            {/* Overall Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    Avg RMS
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {overallStats.avgRMS.toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">µV</p>
              </div>

              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                    Avg SNR
                  </span>
                </div>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {overallStats.avgSNR.toFixed(2)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">ratio</p>
              </div>

              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                    Avg P2P
                  </span>
                </div>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {overallStats.avgPeakToPeak.toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">µV</p>
              </div>
            </div>

            {/* Per-Channel Statistics Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Channel-by-Channel Analysis
              </h4>
              <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Channel</th>
                        <th className="px-3 py-2 text-right font-semibold">Mean</th>
                        <th className="px-3 py-2 text-right font-semibold">RMS</th>
                        <th className="px-3 py-2 text-right font-semibold">P2P</th>
                        <th className="px-3 py-2 text-right font-semibold">SNR</th>
                        <th className="px-3 py-2 text-center font-semibold">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {channelStats.map((stat, idx) => {
                        const quality = getQualityBadge(stat.snr)
                        return (
                          <tr
                            key={stat.channel}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-3 py-2 font-mono font-semibold">{stat.channel}</td>
                            <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">
                              {stat.mean.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">
                              {stat.rms.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">
                              {stat.peakToPeak.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">
                              {stat.snr.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-block w-2 h-2 rounded-full ${quality.color}`} title={quality.label}></span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Educational Info */}
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">📊 Metrics Explained:</p>
                <ul className="space-y-0.5 text-xs">
                  <li><strong>RMS:</strong> Root Mean Square - overall signal power</li>
                  <li><strong>P2P:</strong> Peak-to-Peak amplitude - signal range</li>
                  <li><strong>SNR:</strong> Signal-to-Noise Ratio - quality indicator</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-400">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
