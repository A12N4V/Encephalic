/**
 * Encephalic - Comprehensive MNE Python EEG Analysis Platform
 * Streamlined black & white UI with no vertical overflow
 */
"use client"

import React, { useState, useEffect } from 'react'
import {
  Activity,
  Zap,
  BarChart3,
  Layers,
  Filter,
  Eye,
  Settings,
  Save,
  Brain,
  Waveform,
  Target,
  Network,
  Scissors,
  Clock,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
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

type FeatureCategory =
  | 'signals'
  | 'frequency'
  | 'topomap'
  | 'preprocessing'
  | 'epochs'
  | 'ica'
  | 'source'
  | 'connectivity'
  | 'export'

export default function Dashboard() {
  // State
  const [timePoint, setTimePoint] = useState(0.01)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [activeFeature, setActiveFeature] = useState<FeatureCategory>('signals')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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

  // Mock data for features
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

  // Feature navigation
  const features = [
    { id: 'signals' as const, label: 'Raw Signals', icon: Waveform, description: 'Time-series visualization' },
    { id: 'frequency' as const, label: 'Frequency Analysis', icon: BarChart3, description: 'PSD & Spectrograms' },
    { id: 'topomap' as const, label: 'Topographic Maps', icon: MapPin, description: 'Spatial distribution' },
    { id: 'preprocessing' as const, label: 'Preprocessing', icon: Filter, description: 'Filters & Artifacts' },
    { id: 'epochs' as const, label: 'Epochs', icon: Scissors, description: 'Event-related segments' },
    { id: 'ica' as const, label: 'ICA', icon: Layers, description: 'Independent components' },
    { id: 'source' as const, label: 'Source Analysis', icon: Target, description: 'Source localization' },
    { id: 'connectivity' as const, label: 'Connectivity', icon: Network, description: 'Functional connectivity' },
    { id: 'export' as const, label: 'Export', icon: Save, description: 'Save & export data' },
  ]

  return (
    <div className="viewport-container bg-background">
      {/* Fixed Header - Minimal height */}
      <div className="flex-none h-14 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6" />
          <h1 className="encephalic-title text-2xl tracking-wider">Encephalic</h1>
        </div>
        <div className="flex items-center gap-4">
          {eegInfo && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{eegInfo.n_channels} channels • {eegInfo.duration.toFixed(1)}s • {eegInfo.sfreq}Hz</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area - Fills remaining viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Feature Navigation */}
        <div
          className={`flex-none border-r border-border bg-card transition-all duration-300 ${
            sidebarCollapsed ? 'w-12' : 'w-56'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex-none p-2 border-b border-border">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center h-8 hover:bg-accent rounded transition-colors"
              >
                {sidebarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto minimal-scrollbar">
              <nav className="p-2 space-y-1">
                {features.map(feature => {
                  const Icon = feature.icon
                  const isActive = activeFeature === feature.id
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${
                        isActive
                          ? 'bg-foreground text-background'
                          : 'hover:bg-accent text-foreground'
                      }`}
                      title={sidebarCollapsed ? feature.label : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="flex-1 text-left text-sm">
                          <div className="font-medium">{feature.label}</div>
                          <div className={`text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
                            {feature.description}
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Panel - Scrollable if needed */}
        <div className="flex-1 overflow-hidden bg-background">
          <div className="h-full overflow-y-auto minimal-scrollbar">
            <div className="h-full p-4">
              {/* Raw Signals View */}
              {activeFeature === 'signals' && (
                <div className="h-full flex flex-col gap-4">
                  <div className="flex-none">
                    <InfoPanel data={eegInfo} loading={infoLoading} />
                  </div>
                  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 h-full">
                      <SignalsPanel data={eegData} loading={dataLoading} onTimeClick={handleTimeClick} />
                    </div>
                    <div className="h-full">
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
                </div>
              )}

              {/* Frequency Analysis View */}
              {activeFeature === 'frequency' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 h-full flex flex-col gap-4">
                    <div className="flex-1">
                      <PSDPanel data={psdData} loading={psdLoading} />
                    </div>
                    <div className="flex-1">
                      <SpectrogramPanel data={null} loading={false} />
                    </div>
                  </div>
                  <div className="h-full">
                    <BandsPanel data={bandData} loading={bandLoading} />
                  </div>
                </div>
              )}

              {/* Topomap View */}
              {activeFeature === 'topomap' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-full">
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
                  <div className="h-full">
                    <ElectrodeMontagePanel data={mockElectrodeData} loading={false} />
                  </div>
                </div>
              )}

              {/* Preprocessing View */}
              {activeFeature === 'preprocessing' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 grid grid-rows-2 gap-4 h-full">
                    <div>
                      <FilterControlsPanel />
                    </div>
                    <div>
                      <ArtifactDetectionPanel artifacts={mockArtifacts} loading={false} />
                    </div>
                  </div>
                  <div className="h-full">
                    <ChannelSelectorPanel
                      channels={eegData?.labels || []}
                      selectedChannels={selectedChannels}
                      onChannelToggle={handleChannelToggle}
                      onPresetSelect={handlePresetSelect}
                      loading={dataLoading}
                    />
                  </div>
                </div>
              )}

              {/* Epochs View */}
              {activeFeature === 'epochs' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-full">
                    <EventMarkingPanel
                      events={events}
                      onAddEvent={handleAddEvent}
                      onDeleteEvent={handleDeleteEvent}
                      currentTime={timePoint}
                    />
                  </div>
                  <div className="h-full">
                    <div className="h-full rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Scissors className="w-5 h-5" />
                        <h3 className="font-semibold">Epoch Analysis</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-2">Extract and analyze event-related potentials (ERPs):</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Create epochs around events</li>
                          <li>Baseline correction</li>
                          <li>Epoch averaging</li>
                          <li>Reject bad epochs</li>
                          <li>Time-frequency analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ICA View */}
              {activeFeature === 'ica' && (
                <div className="h-full">
                  <div className="h-full rounded-lg border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-6 h-6" />
                      <h3 className="text-xl font-semibold">Independent Component Analysis</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">ICA Decomposition</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Separate neural signals from artifacts using independent component analysis.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li>FastICA, Infomax, SOBI algorithms</li>
                          <li>Automatic component classification</li>
                          <li>EOG/ECG artifact detection</li>
                          <li>Component topographies</li>
                          <li>Time course visualization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Component Selection</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Identify and remove artifact components from your data.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li>Interactive component browser</li>
                          <li>Power spectral density plots</li>
                          <li>Correlation with reference channels</li>
                          <li>Apply component exclusion</li>
                          <li>Compare before/after reconstruction</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Analysis View */}
              {activeFeature === 'source' && (
                <div className="h-full">
                  <div className="h-full rounded-lg border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-6 h-6" />
                      <h3 className="text-xl font-semibold">Source Localization</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Forward Modeling</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Build forward models for source estimation.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li>BEM/FEM head models</li>
                          <li>Source space creation</li>
                          <li>Lead field computation</li>
                          <li>Coordinate transformations</li>
                          <li>Forward solution validation</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Inverse Solutions</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Estimate cortical sources from sensor data.
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li>Minimum-norm estimates (MNE)</li>
                          <li>dSPM, sLORETA, eLORETA</li>
                          <li>LCMV/DICS beamformers</li>
                          <li>Dynamic statistical parametric mapping</li>
                          <li>Source time courses & movies</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connectivity View */}
              {activeFeature === 'connectivity' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-full">
                    <ConnectivityPanel data={mockConnectivityData} loading={false} />
                  </div>
                  <div className="h-full">
                    <div className="h-full rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Network className="w-5 h-5" />
                        <h3 className="font-semibold">Connectivity Methods</h3>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Time Domain</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Correlation & Covariance</li>
                            <li>Cross-correlation</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Frequency Domain</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Coherence & Phase locking</li>
                            <li>Phase lag index (PLI)</li>
                            <li>Weighted PLI (wPLI)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Directed Connectivity</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Granger causality</li>
                            <li>Transfer entropy</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Export View */}
              {activeFeature === 'export' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 h-full">
                    <ExportPanel />
                  </div>
                  <div className="h-full">
                    <StatsPanel data={eegData} loading={dataLoading} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
