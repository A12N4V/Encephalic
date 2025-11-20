/**
 * Info Panel - System status and metadata
 */
"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, Cpu, Clock, Database, Loader2 } from 'lucide-react'
import { EEGInfo } from '@/hooks/useEEGData'

interface InfoPanelProps {
  data: EEGInfo | null
  loading: boolean
}

export function InfoPanel({ data, loading }: InfoPanelProps) {
  if (loading || !data) {
    return (
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading system information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      icon: Activity,
      label: 'Channels',
      value: data.n_channels,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-500'
    },
    {
      icon: Cpu,
      label: 'Sampling Rate',
      value: `${data.sampling_freq} Hz`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      iconBg: 'bg-blue-500'
    },
    {
      icon: Clock,
      label: 'Duration',
      value: `${data.duration.toFixed(1)}s`,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-950/30',
      iconBg: 'bg-purple-500'
    },
    {
      icon: Database,
      label: 'Total Samples',
      value: data.n_samples.toLocaleString(),
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-100 dark:bg-pink-950/30',
      iconBg: 'bg-pink-500'
    },
  ]

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 card-hover`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-1.5 ${stat.iconBg} rounded-md`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${stat.color} tabular-nums`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
