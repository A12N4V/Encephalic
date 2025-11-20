/**
 * Topographic Map Panel - Brain activity spatial distribution
 */
"use client"

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Brain, Play, Pause, Loader2 } from 'lucide-react'

interface TopomapPanelProps {
  imageUrl: string | null
  loading: boolean
  timePoint: number
  maxTime: number
  isPlaying: boolean
  onTimeChange: (time: number) => void
  onPlayPause: () => void
}

export function TopomapPanel({
  imageUrl,
  loading,
  timePoint,
  maxTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
}: TopomapPanelProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Brain Topography
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Spatial activity at {timePoint.toFixed(2)}s
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-3 border border-slate-200 dark:border-slate-800">
          <Button
            onClick={onPlayPause}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-9 w-9 p-0 shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="flex-1">
            <Slider
              value={[timePoint]}
              onValueChange={(value) => onTimeChange(value[0])}
              max={maxTime}
              step={0.01}
              className="w-full"
            />
          </div>
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 w-16 text-right tabular-nums">
            {timePoint.toFixed(2)}s
          </span>
        </div>

        {/* Topomap Image */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 rounded-lg p-4 flex items-center justify-center min-h-[320px] border border-slate-200 dark:border-slate-800">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Rendering topographic map...</p>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full max-w-[400px] h-[320px]">
              <Image
                src={imageUrl}
                alt="Topographic Map"
                fill
                className="object-contain rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="text-center">
              <Brain className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
