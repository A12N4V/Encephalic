"use client"

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Activity, Brain, Waves } from 'lucide-react'
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

export default function EEGVisualization() {
  const [eegData, setEegData] = useState<EEGData | null>(null)
  const [eegInfo, setEegInfo] = useState<EEGInfo | null>(null)
  const [psdData, setPsdData] = useState<PSDData | null>(null)
  const [topomap, setTopomap] = useState<string | null>(null)
  const [timePoint, setTimePoint] = useState(0.01)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEEGInfo()
    fetchEEGData()
    fetchPSD()
  }, [])

  useEffect(() => {
    fetchTopomap(timePoint)
  }, [timePoint])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isPlaying && eegInfo) {
      interval = setInterval(() => {
        setTimePoint((prev) => {
          const next = prev + 0.1
          return next >= eegInfo.duration ? 0 : next
        })
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, eegInfo])

  const fetchEEGInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/eeg-info`)
      setEegInfo(response.data)
    } catch (error) {
      console.error('Error fetching EEG info:', error)
    }
  }

  const fetchEEGData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/eeg-data?tmin=0&tmax=10`)
      setEegData(response.data)
    } catch (error) {
      console.error('Error fetching EEG data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPSD = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/eeg-psd`)
      setPsdData(response.data)
    } catch (error) {
      console.error('Error fetching PSD:', error)
    }
  }

  const fetchTopomap = async (time: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/eeg-topomap/${time}`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(response.data)
      setTopomap(url)
    } catch (error) {
      console.error('Error fetching topomap:', error)
    }
  }

  const handlePlotClick = (data: any) => {
    if (data.points && data.points[0]) {
      const clickedTime = data.points[0].x
      setTimePoint(clickedTime)
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const plotData = eegData
    ? eegData.labels.slice(0, 10).map((label, index) => ({
        x: eegData.times,
        y: eegData.data[index],
        mode: 'lines' as const,
        name: label,
        line: {
          width: 1,
        },
      }))
    : []

  const psdPlotData = psdData
    ? [
        {
          x: psdData.frequencies,
          y: psdData.psd,
          mode: 'lines' as const,
          name: 'Average PSD',
          line: {
            color: 'rgb(99, 102, 241)',
            width: 2,
          },
          fill: 'tozeroy' as const,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-500" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Encephalic
              </h1>
              <p className="text-sm text-slate-400">
                Advanced EEG Visualization Platform
              </p>
            </div>
          </div>

          {eegInfo && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-400">Channels</p>
                    <p className="text-xl font-bold text-blue-400">{eegInfo.n_channels}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Sampling Rate</p>
                    <p className="text-xl font-bold text-purple-400">{eegInfo.sampling_freq} Hz</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="text-xl font-bold text-green-400">{eegInfo.duration.toFixed(1)}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="signals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="topomap" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Topographic Map
            </TabsTrigger>
            <TabsTrigger value="frequency" className="flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Frequency Analysis
            </TabsTrigger>
          </TabsList>

          {/* EEG Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">EEG Signals</CardTitle>
                <CardDescription>
                  Click on the plot to view topographic map at that time point
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-pulse text-slate-400">Loading EEG data...</div>
                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-lg p-4">
                    <Plot
                      data={plotData}
                      layout={{
                        autosize: true,
                        height: 500,
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        xaxis: {
                          title: { text: 'Time (s)' },
                          color: '#94a3b8',
                          gridcolor: '#334155',
                        },
                        yaxis: {
                          title: { text: 'Amplitude (µV)' },
                          color: '#94a3b8',
                          gridcolor: '#334155',
                        },
                        font: {
                          color: '#94a3b8',
                        },
                        legend: {
                          bgcolor: 'rgba(0,0,0,0.5)',
                          font: {
                            color: '#94a3b8',
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
          </TabsContent>

          {/* Topographic Map Tab */}
          <TabsContent value="topomap" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Topographic Map</CardTitle>
                <CardDescription>
                  Brain activity distribution at {timePoint.toFixed(2)}s
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    variant="outline"
                    size="icon"
                    className="bg-slate-800 border-slate-600 hover:bg-slate-700"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <Slider
                      value={[timePoint]}
                      onValueChange={(value) => {
                        setTimePoint(value[0])
                        setIsPlaying(false)
                      }}
                      max={eegInfo?.duration || 10}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm font-mono text-slate-400 w-20 text-right">
                    {timePoint.toFixed(2)}s
                  </span>
                </div>
                <div className="bg-slate-950 rounded-lg p-8 flex items-center justify-center min-h-[500px]">
                  {topomap ? (
                    <img
                      src={topomap}
                      alt="Topographic Map"
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="text-slate-400 animate-pulse">
                      Loading topographic map...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frequency Analysis Tab */}
          <TabsContent value="frequency" className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Power Spectral Density</CardTitle>
                <CardDescription>
                  Frequency domain analysis of EEG signals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 rounded-lg p-4">
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
                          color: '#94a3b8',
                          gridcolor: '#334155',
                        },
                        yaxis: {
                          title: { text: 'Power (µV²/Hz)' },
                          type: 'log',
                          color: '#94a3b8',
                          gridcolor: '#334155',
                        },
                        font: {
                          color: '#94a3b8',
                        },
                        margin: { t: 20, r: 20, b: 50, l: 60 },
                      }}
                      useResizeHandler
                      style={{ width: '100%' }}
                      config={{ responsive: true }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-pulse text-slate-400">Loading PSD data...</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
