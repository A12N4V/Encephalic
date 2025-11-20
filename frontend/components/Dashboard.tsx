/**
 * Main Dashboard - Terminal-style EEG Analysis Board
 * Comprehensive layout with modular panels
 */
"use client"

import React, { useState, useEffect } from 'react'
import { Brain, Terminal } from 'lucide-react'
import {
  useEEGInfo,
  useEEGData,
  usePSDData,
  useBandData,
  useTopomap,
} from '@/hooks/useEEGData'
import { SignalsPanel } from './panels/SignalsPanel'
import { TopomapPanel } from './panels/TopomapPanel'
import { PSDPanel } from './panels/PSDPanel'
import { BandsPanel } from './panels/BandsPanel'
import { InfoPanel } from './panels/InfoPanel'
import { ThemeToggle } from './ThemeToggle'

export default function Dashboard() {
  // State
  const [timePoint, setTimePoint] = useState(0.01)
  const [isPlaying, setIsPlaying] = useState(false)

  // Data hooks
  const { data: eegInfo, loading: infoLoading } = useEEGInfo()
  const { data: eegData, loading: dataLoading } = useEEGData(0, 10)
  const { data: psdData, loading: psdLoading } = usePSDData()
  const { data: bandData, loading: bandLoading } = useBandData()
  const { imageUrl: topomap, loading: topomapLoading } = useTopomap(timePoint, 200)

  // Playback effect
  useEffect(() => {
    if (!isPlaying || !eegInfo) return

    const interval = setInterval(() => {
      setTimePoint((prev) => {
        const next = prev + 0.1
        return next >= eegInfo.duration ? 0.01 : next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, eegInfo])

  const handleTimeClick = (time: number) => {
    setTimePoint(time)
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-4 font-mono">
      <ThemeToggle />

      {/* Terminal Header */}
      <div className="max-w-[1920px] mx-auto mb-4">
        <div className="border border-green-500/50 rounded-lg p-4 bg-black/80 backdrop-blur">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-green-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-500" />
                  <h1 className="text-2xl font-bold text-green-500 tracking-wider">
                    ENCEPHALIC ANALYSIS TERMINAL
                  </h1>
                </div>
                <p className="text-xs text-green-500/70 mt-1">
                  &gt; ADVANCED EEG SIGNAL PROCESSING & VISUALIZATION SYSTEM v2.0
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 border border-green-500/30 rounded bg-green-500/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500 font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* Info Panel - Full Width */}
        <InfoPanel data={eegInfo} loading={infoLoading} />

        {/* Top Row - Signals (2/3) + Topomap (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SignalsPanel
              data={eegData}
              loading={dataLoading}
              onTimeClick={handleTimeClick}
            />
          </div>
          <div className="lg:col-span-1">
            <TopomapPanel
              imageUrl={topomap}
              loading={topomapLoading}
              timePoint={timePoint}
              maxTime={eegInfo?.duration || 10}
              isPlaying={isPlaying}
              onTimeChange={setTimePoint}
              onPlayPause={handlePlayPause}
            />
          </div>
        </div>

        {/* Bottom Row - PSD (2/3) + Bands (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PSDPanel data={psdData} loading={psdLoading} />
          </div>
          <div className="lg:col-span-1">
            <BandsPanel data={bandData} loading={bandLoading} />
          </div>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="max-w-[1920px] mx-auto mt-4">
        <div className="border border-green-500/30 rounded p-2 bg-black/50 text-center">
          <p className="text-[10px] text-green-500/70">
            &gt; POWERED BY MNE-PYTHON | DJANGO REST | NEXT.JS | SHADCN
          </p>
        </div>
      </div>
    </div>
  )
}
