/**
 * Info Panel - System status and metadata
 */
"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, Cpu, Clock, Database } from 'lucide-react'
import { EEGInfo } from '@/hooks/useEEGData'

interface InfoPanelProps {
  data: EEGInfo | null
  loading: boolean
}

export function InfoPanel({ data, loading }: InfoPanelProps) {
  if (loading || !data) {
    return (
      <Card className="bg-black border-emerald-500/30">
        <CardContent className="p-3">
          <div className="text-emerald-500 font-mono text-xs animate-pulse">
            &gt; LOADING SYSTEM INFO...
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    { icon: Activity, label: 'CHANNELS', value: data.n_channels, color: 'text-emerald-500' },
    { icon: Cpu, label: 'SAMPLING', value: `${data.sampling_freq} Hz`, color: 'text-emerald-500' },
    { icon: Clock, label: 'DURATION', value: `${data.duration.toFixed(1)}s`, color: 'text-emerald-500' },
    { icon: Database, label: 'SAMPLES', value: data.n_samples.toLocaleString(), color: 'text-emerald-500' },
  ]

  return (
    <Card className="bg-black border-emerald-500/30">
      <CardContent className="p-3">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-black/50 border border-emerald-500/20 rounded p-2 text-center"
            >
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-[9px] text-emerald-500/70 font-mono mb-1">
                {stat.label}
              </p>
              <p className={`text-sm font-bold ${stat.color} font-mono`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
