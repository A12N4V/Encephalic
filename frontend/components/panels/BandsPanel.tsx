/**
 * Frequency Bands Panel - Band power analysis
 */
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Zap } from 'lucide-react'
import { BandData } from '@/hooks/useEEGData'

interface BandsPanelProps {
  data: BandData | null
  loading: boolean
}

const BAND_INFO = [
  { name: 'delta', label: 'DELTA', range: '0.5-4 Hz', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  { name: 'theta', label: 'THETA', range: '4-8 Hz', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  { name: 'alpha', label: 'ALPHA', range: '8-13 Hz', color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  { name: 'beta', label: 'BETA', range: '13-30 Hz', color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  { name: 'gamma', label: 'GAMMA', range: '30-50 Hz', color: 'text-violet-500', bg: 'bg-violet-500/20', border: 'border-violet-500/30' },
]

export function BandsPanel({ data, loading }: BandsPanelProps) {
  return (
    <Card className="bg-black border-amber-500/30 h-full">
      <CardHeader className="border-b border-amber-500/30 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          <CardTitle className="text-amber-500 text-sm font-mono uppercase tracking-wider">
            Frequency Band Analysis
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-amber-500 font-mono text-xs animate-pulse">
              &gt; ANALYZING BANDS...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {BAND_INFO.map((band) => {
              const value = data?.[band.name as keyof BandData] ?? 0
              return (
                <div
                  key={band.name}
                  className={`${band.bg} border ${band.border} rounded p-2 text-center`}
                >
                  <Zap className={`w-3 h-3 mx-auto mb-1 ${band.color}`} />
                  <p className={`text-[10px] ${band.color} font-mono font-bold mb-1`}>
                    {band.label}
                  </p>
                  <p className={`text-xs ${band.color} font-mono`}>
                    {band.range}
                  </p>
                  <p className={`text-lg font-bold ${band.color} mt-1`}>
                    {value.toFixed(2)}
                  </p>
                  <p className={`text-[8px] ${band.color} opacity-70`}>
                    µV²/Hz
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
