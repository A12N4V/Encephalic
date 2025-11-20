/**
 * Frequency Bands Panel - Band power analysis
 */
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Loader2 } from 'lucide-react'
import { BandData } from '@/hooks/useEEGData'

interface BandsPanelProps {
  data: BandData | null
  loading: boolean
}

const BAND_INFO = [
  {
    name: 'delta',
    label: 'Delta',
    range: '0.5-4 Hz',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    icon: 'bg-rose-500'
  },
  {
    name: 'theta',
    label: 'Theta',
    range: '4-8 Hz',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'bg-orange-500'
  },
  {
    name: 'alpha',
    label: 'Alpha',
    range: '8-13 Hz',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-500'
  },
  {
    name: 'beta',
    label: 'Beta',
    range: '13-30 Hz',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-500'
  },
  {
    name: 'gamma',
    label: 'Gamma',
    range: '30-50 Hz',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'bg-violet-500'
  },
]

export function BandsPanel({ data, loading }: BandsPanelProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-lg">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Frequency Bands
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Power distribution across brain wave bands
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Analyzing frequency bands...</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {BAND_INFO.map((band) => {
              const value = data?.[band.name as keyof BandData] ?? 0
              return (
                <div
                  key={band.name}
                  className={`${band.bg} border ${band.border} rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-all duration-200 card-hover`}
                >
                  <div className={`w-2 h-2 ${band.icon} rounded-full mx-auto mb-2`}></div>
                  <p className={`text-xs font-semibold ${band.color} mb-1`}>
                    {band.label}
                  </p>
                  <p className={`text-[10px] ${band.color} opacity-70 mb-2`}>
                    {band.range}
                  </p>
                  <p className={`text-xl font-bold ${band.color} tabular-nums`}>
                    {value.toFixed(2)}
                  </p>
                  <p className={`text-[9px] ${band.color} opacity-60 mt-1`}>
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
