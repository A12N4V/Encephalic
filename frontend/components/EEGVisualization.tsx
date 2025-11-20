"use client"

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Pause, Activity, Brain, Waves, TrendingUp, Zap } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import axios from 'axios'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface EEGData {
  labels: string[]
  data: number[][]
  times: number[]
  sfreq: number
}

interface EEGInfo {
  n_channels: number
  channel_names: string[]
  sampling_freq: number
  duration: number
  n_samples: number
}

interface PSDData {
  frequencies: number[]
  psd: number[]
  channel_psds: number[][]
  channel_names: string[]
}

interface BandData {
  delta: number
  theta: number
  alpha: number
  beta: number
  gamma: number
}

export default function EEGVisualization() {
  const [eegData, setEegData] = useState<EEGData | null>(null)
  const [eegInfo, setEegInfo] = useState<EEGInfo | null>(null)
  const [psdData, setPsdData] = useState<PSDData | null>(null)
  const [bandData, setBandData] = useState<BandData | null>(null)
  const [topomap, setTopomap] = useState<string | null>(null)
  const [timePoint, setTimePoint] = useState(0.01)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[EEGVisualization] Component mounted')
    console.log('[EEGVisualization] API URL:', API_URL)
    fetchEEGInfo()
    fetchEEGData()
    fetchPSD()
    fetchBands()
  }, [])

  useEffect(() => {
    console.log('[EEGVisualization] Time point changed:', timePoint)
    fetchTopomap(timePoint)
  }, [timePoint])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && eegInfo) {
      console.log('[EEGVisualization] Playback started')
      interval = setInterval(() => {
        setTimePoint((prev) => {
          const next = prev + 0.1
          const wrapped = next >= eegInfo.duration ? 0 : next
          console.log('[EEGVisualization] Playback tick:', prev, '->', wrapped)
          return wrapped
        })
      }, 100)
    } else if (!isPlaying) {
      console.log('[EEGVisualization] Playback paused')
    }

    return () => {
      if (interval) {
        console.log('[EEGVisualization] Clearing playback interval')
        clearInterval(interval)
      }
    }
  }, [isPlaying, eegInfo])

  const fetchEEGInfo = async () => {
    console.log('[EEGVisualization] Fetching EEG info...')
    try {
      const response = await axios.get(`${API_URL}/api/eeg-info`)
      console.log('[EEGVisualization] EEG info received:', response.data)
      setEegInfo(response.data)
    } catch (error) {
      console.error('[EEGVisualization] Error fetching EEG info:', error)
      if (axios.isAxiosError(error)) {
        console.error('[EEGVisualization] Axios error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    }
  }

  const fetchEEGData = async () => {
    console.log('[EEGVisualization] Fetching EEG data...')
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/eeg-data?tmin=0&tmax=10`)
      console.log('[EEGVisualization] EEG data received:', {
        labels: response.data.labels,
        dataShape: [response.data.data.length, response.data.data[0]?.length],
        timesLength: response.data.times.length,
        sfreq: response.data.sfreq
      })
      setEegData(response.data)
    } catch (error) {
      console.error('[EEGVisualization] Error fetching EEG data:', error)
      if (axios.isAxiosError(error)) {
        console.error('[EEGVisualization] Axios error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    } finally {
      setLoading(false)
      console.log('[EEGVisualization] EEG data loading complete')
    }
  }

  const fetchPSD = async () => {
    console.log('[EEGVisualization] Fetching PSD data...')
    try {
      const response = await axios.get(`${API_URL}/api/eeg-psd`)
      console.log('[EEGVisualization] PSD data received:', {
        frequenciesLength: response.data.frequencies.length,
        psdLength: response.data.psd.length,
        channels: response.data.channel_names.length
      })
      setPsdData(response.data)
    } catch (error) {
      console.error('[EEGVisualization] Error fetching PSD:', error)
      if (axios.isAxiosError(error)) {
        console.error('[EEGVisualization] Axios error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    }
  }

  const fetchBands = async () => {
    console.log('[EEGVisualization] Fetching frequency band data...')
    try {
      const response = await axios.get(`${API_URL}/api/eeg-bands`)
      console.log('[EEGVisualization] Frequency band data received:', response.data)
      setBandData(response.data)
    } catch (error) {
      console.error('[EEGVisualization] Error fetching frequency bands:', error)
      if (axios.isAxiosError(error)) {
        console.error('[EEGVisualization] Axios error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status
        })
      }
    }
  }

  const fetchTopomap = async (time: number) => {
    console.log('[EEGVisualization] Fetching topomap for time:', time)
    try {
      const response = await axios.get(`${API_URL}/api/eeg-topomap/${time}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      console.log('[EEGVisualization] Topomap blob URL created:', url)
      setTopomap(url)
    } catch (error) {
      console.error('[EEGVisualization] Error fetching topomap:', error)
      if (axios.isAxiosError(error)) {
        console.error('[EEGVisualization] Axios error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status
        })
      }
    }
  }

  const handlePlotClick = (data: any) => {
    console.log('[EEGVisualization] Plot clicked:', data)
    if (data.points && data.points[0]) {
      const clickedTime = data.points[0].x
      console.log('[EEGVisualization] Setting time point to:', clickedTime)
      setTimePoint(clickedTime)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    console.log('[EEGVisualization] Toggle play/pause:', isPlaying, '->', !isPlaying)
    setIsPlaying(!isPlaying)
  }

  const plotData = eegData
    ? eegData.labels.slice(0, 10).map((label, index) => {
        console.log('[EEGVisualization] Creating plot data for channel:', label)
        return {
          x: eegData.times,
          y: eegData.data[index],
          mode: 'lines' as const,
          name: label,
          line: {
            width: 1,
            color: `hsl(0, 0%, ${100 - index * 8}%)`,
          },
        }
      })
    : []

  const psdPlotData = psdData
    ? [
        {
          x: psdData.frequencies,
          y: psdData.psd,
          mode: 'lines' as const,
          name: 'Average PSD',
          line: {
            color: '#000000',
            width: 2,
          },
          fill: 'tozeroy' as const,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-background p-6">
      <ThemeToggle />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <Brain className="w-12 h-12 text-foreground" />
            <div>
              <h1 className="text-5xl font-bold text-foreground">
                Encephalic
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced EEG Analysis & Visualization Platform
              </p>
            </div>
          </div>

          {eegInfo && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Channels</p>
                    <p className="text-2xl font-bold text-foreground">{eegInfo.n_channels}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sampling Rate</p>
                    <p className="text-2xl font-bold text-foreground">{eegInfo.sampling_freq} Hz</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold text-foreground">{eegInfo.duration.toFixed(1)}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Samples</p>
                    <p className="text-2xl font-bold text-foreground">{eegInfo.n_samples.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content - Single Scrollable Window */}
        <div className="space-y-6">

          {/* EEG Signals Section */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-foreground" />
                <div>
                  <CardTitle className="text-foreground text-2xl">EEG Signals</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Real-time neural activity traces - Click on the plot to view topographic map at that time point
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-pulse text-muted-foreground">Loading EEG data...</div>
                </div>
              ) : (
                <div className="bg-secondary rounded-lg p-4">
                  <Plot
                    data={plotData}
                    layout={{
                      autosize: true,
                      height: 500,
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      xaxis: {
                        title: { text: 'Time (s)' },
                        color: '#666666',
                        gridcolor: '#cccccc',
                      },
                      yaxis: {
                        title: { text: 'Amplitude (µV)' },
                        color: '#666666',
                        gridcolor: '#cccccc',
                      },
                      font: {
                        color: '#666666',
                      },
                      legend: {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        font: {
                          color: '#666666',
                        },
                      },
                      margin: { t: 20, r: 20, b: 50, l: 60 },
                    }}
                    onClick={handlePlotClick}
                    useResizeHandler
                    style={{ width: '100%' }}
                    config={{ responsive: true }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Topographic Map Section */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-foreground" />
                <div>
                  <CardTitle className="text-foreground text-2xl">Topographic Map</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Spatial distribution of brain activity at {timePoint.toFixed(2)}s
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlayPause}
                  variant="outline"
                  size="icon"
                  className="bg-background border-border hover:bg-accent"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <div className="flex-1">
                  <Slider
                    value={[timePoint]}
                    onValueChange={(value) => {
                      console.log('[EEGVisualization] Slider value changed:', value[0])
                      setTimePoint(value[0])
                      setIsPlaying(false)
                    }}
                    max={eegInfo?.duration || 10}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                <span className="text-sm font-mono text-muted-foreground w-24 text-right">
                  {timePoint.toFixed(2)}s
                </span>
              </div>
              <div className="bg-secondary rounded-lg p-8 flex items-center justify-center min-h-[500px]">
                {topomap ? (
                  <img
                    src={topomap}
                    alt="Topographic Map"
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="text-muted-foreground animate-pulse">
                    Loading topographic map...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Frequency Analysis Section */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <Waves className="w-6 h-6 text-foreground" />
                <div>
                  <CardTitle className="text-foreground text-2xl">Power Spectral Density</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Frequency domain analysis of neural oscillations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-secondary rounded-lg p-4">
                {psdData ? (
                  <Plot
                    data={psdPlotData}
                    layout={{
                      autosize: true,
                      height: 500,
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      xaxis: {
                        title: { text: 'Frequency (Hz)' },
                        color: '#666666',
                        gridcolor: '#cccccc',
                      },
                      yaxis: {
                        title: { text: 'Power (µV²/Hz)' },
                        type: 'log',
                        color: '#666666',
                        gridcolor: '#cccccc',
                      },
                      font: {
                        color: '#666666',
                      },
                      margin: { t: 20, r: 20, b: 50, l: 60 },
                    }}
                    useResizeHandler
                    style={{ width: '100%' }}
                    config={{ responsive: true }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-muted-foreground">Loading PSD data...</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Frequency Bands Section */}
          {bandData && (
            <Card className="bg-card border-border">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-foreground" />
                  <div>
                    <CardTitle className="text-foreground text-2xl">Frequency Band Power</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Average power in different frequency bands
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Delta (0.5-4 Hz)</p>
                    <p className="text-2xl font-bold text-foreground">{bandData.delta.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">µV²/Hz</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Theta (4-8 Hz)</p>
                    <p className="text-2xl font-bold text-foreground">{bandData.theta.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">µV²/Hz</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Alpha (8-13 Hz)</p>
                    <p className="text-2xl font-bold text-foreground">{bandData.alpha.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">µV²/Hz</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Beta (13-30 Hz)</p>
                    <p className="text-2xl font-bold text-foreground">{bandData.beta.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">µV²/Hz</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-xs text-muted-foreground mb-1">Gamma (30-50 Hz)</p>
                    <p className="text-2xl font-bold text-foreground">{bandData.gamma.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">µV²/Hz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
