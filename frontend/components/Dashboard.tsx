/**
 * Main Dashboard - Modern EEG Analysis Board
 * Professional layout with comprehensive data visualization
 */
"use client"

import React, { useState, useEffect } from 'react'
import { Brain, Activity, Zap, BarChart3 } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <ThemeToggle />

      {/* Modern Header */}
      <div className="max-w-[1920px] mx-auto mb-6 animate-fadeIn">
        <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Gradient Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              {/* Title Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse-soft"></div>
                  <Brain className="relative w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Encephalic Analysis Board
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Advanced EEG Signal Processing & Visualization Platform
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Info Panel - Full Width */}
        <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <InfoPanel data={eegInfo} loading={infoLoading} />
        </div>

        {/* Top Row - Signals (2/3) + Topomap (1/3) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <div className="xl:col-span-2">
            <SignalsPanel
              data={eegData}
              loading={dataLoading}
              onTimeClick={handleTimeClick}
            />
          </div>
          <div className="xl:col-span-1">
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <div className="xl:col-span-2">
            <PSDPanel data={psdData} loading={psdLoading} />
          </div>
          <div className="xl:col-span-1">
            <BandsPanel data={bandData} loading={bandLoading} />
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="max-w-[1920px] mx-auto mt-8 animate-fadeIn" style={{ animationDelay: '400ms' }}>
        <div className="rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Zap className="w-3 h-3" />
            <span>Powered by MNE-Python, Flask, Next.js & shadcn/ui</span>
            <BarChart3 className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
