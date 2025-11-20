/**
 * Topographic Map Panel - Brain activity spatial distribution
 */
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Brain, Play, Pause } from 'lucide-react'

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
    <Card className="bg-black border-cyan-500/30 h-full">
      <CardHeader className="border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-500" />
          <CardTitle className="text-cyan-500 text-sm font-mono uppercase tracking-wider">
            Brain Topomap [T={timePoint.toFixed(2)}s]
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-black/50 border border-cyan-500/20 rounded p-2">
          <Button
            onClick={onPlayPause}
            variant="outline"
            size="sm"
            className="bg-black border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black h-7 w-7 p-0"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </Button>
          <div className="flex-1">
            <Slider
              value={[timePoint]}
              onValueChange={(value) => onTimeChange(value[0])}
              max={maxTime}
              step={0.01}
              className="w-full [&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-500"
            />
          </div>
          <span className="text-xs font-mono text-cyan-500 w-16 text-right">
            {timePoint.toFixed(2)}s
          </span>
        </div>

        {/* Topomap Image */}
        <div className="bg-black/50 border border-cyan-500/20 rounded p-2 flex items-center justify-center min-h-[280px]">
          {loading ? (
            <div className="text-cyan-500 font-mono text-xs animate-pulse">
              &gt; RENDERING TOPOMAP...
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Topographic Map"
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="text-cyan-500/50 font-mono text-xs">
              &gt; NO DATA
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
