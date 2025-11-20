/**
 * Main Dashboard - State-of-the-Art EEG Analysis Platform
 * Comprehensive visualization and education tool with advanced features
 */
"use client"

import React, { useState, useEffect } from 'react'
import { Brain, Activity, Zap, BarChart3, Layers } from 'lucide-react'
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
import { ChannelSelectorPanel } from './panels/ChannelSelectorPanel'
import { StatsPanel } from './panels/StatsPanel'
import { ExportPanel } from './panels/ExportPanel'
import { FilterControlsPanel } from './panels/FilterControlsPanel'
import { SpectrogramPanel } from './panels/SpectrogramPanel'
import { ConnectivityPanel } from './panels/ConnectivityPanel'
import { ElectrodeMontagePanel } from './panels/ElectrodeMontagePanel'
import { EventMarkingPanel } from './panels/EventMarkingPanel'
import { ArtifactDetectionPanel } from './panels/ArtifactDetectionPanel'
import { ThemeToggle } from './ThemeToggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Dashboard() {
  // State
  const [timePoint, setTimePoint] = useState(0.01)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [activeView, setActiveView] = useState('overview')

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

  // Initialize selected channels
  useEffect(() => {
    if (eegData && selectedChannels.length === 0) {
      setSelectedChannels(eegData.labels)
    }
  }, [eegData, selectedChannels.length])

  const handleTimeClick = (time: number) => {
    setTimePoint(time)
    setIsPlaying(false)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(ch => ch !== channel)
        : [...prev, channel]
    )
  }

  const handlePresetSelect = (channels: string[]) => {
    setSelectedChannels(channels)
  }

  const handleAddEvent = (event: any) => {
    setEvents(prev => [...prev, { ...event, id: Date.now().toString() }])
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  // Mock data for new features (to be replaced with backend calls)
  const mockElectrodeData = eegData ? {
    positions: eegData.labels.slice(0, 10).map((label, i) => ({
      channel: label,
      x: Math.cos(i * 0.6) * 0.9,
      y: Math.sin(i * 0.6) * 0.9,
      z: 0.3 + Math.random() * 0.4
    })),
    selectedChannels
  } : null

  const mockConnectivityData = eegData ? {
    channels: eegData.labels.slice(0, 8),
    correlationMatrix: Array(8).fill(0).map(() =>
      Array(8).fill(0).map(() => Math.random() * 2 - 1)
    )
  } : null

  const mockArtifacts = [
    { type: 'eye_blink' as const, channel: 'Fp1', time: 2.5, duration: 0.2, severity: 'medium' as const },
    { type: 'muscle' as const, channel: 'T4', time: 4.2, duration: 0.5, severity: 'high' as const },
    { type: 'movement' as const, channel: 'C3', time: 7.1, duration: 0.3, severity: 'low' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-black dark:via-black dark:to-black p-6">
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
                    State-of-the-Art EEG Visualization & Education Platform
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Live Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="max-w-[1920px] mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800">
            <TabsTrigger value="overview" className="gap-2">
              <Layers className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Brain className="w-4 h-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-2">
              <Activity className="w-4 h-4" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Zap className="w-4 h-4" />
              Tools
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="animate-fadeIn">
              <InfoPanel data={eegInfo} loading={infoLoading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="xl:col-span-2">
                <SignalsPanel data={eegData} loading={dataLoading} onTimeClick={handleTimeClick} />
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
              <div className="xl:col-span-2">
                <PSDPanel data={psdData} loading={psdLoading} />
              </div>
              <div className="xl:col-span-1">
                <BandsPanel data={bandData} loading={bandLoading} />
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <SpectrogramPanel data={null} loading={false} />
              </div>
              <div className="xl:col-span-1">
                <FilterControlsPanel />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ConnectivityPanel data={mockConnectivityData} loading={false} />
              <ElectrodeMontagePanel data={mockElectrodeData} loading={false} />
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <StatsPanel data={eegData} loading={dataLoading} />
              </div>
              <div className="xl:col-span-1">
                <ChannelSelectorPanel
                  channels={eegData?.labels || []}
                  selectedChannels={selectedChannels}
                  onChannelToggle={handleChannelToggle}
                  onPresetSelect={handlePresetSelect}
                  loading={dataLoading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ArtifactDetectionPanel artifacts={mockArtifacts} loading={false} />
              <EventMarkingPanel
                events={events}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                currentTime={timePoint}
              />
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <ExportPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modern Footer */}
      <div className="max-w-[1920px] mx-auto mt-8 animate-fadeIn">
        <div className="rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Zap className="w-3 h-3" />
            <span>Powered by MNE-Python, Flask, Next.js & shadcn/ui • State-of-the-Art EEG Analysis Platform</span>
            <BarChart3 className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
