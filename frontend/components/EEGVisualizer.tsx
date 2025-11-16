'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Moon, Sun, Activity, Brain, Zap } from 'lucide-react';
import axios from 'axios';

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface EEGData {
  labels: string[];
  data: number[][];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EEGVisualizer() {
  const [eegData, setEegData] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<string | null>(null);
  const [eeg3DImage, setEeg3DImage] = useState<string | null>(null);
  const [timePoint, setTimePoint] = useState(0.01);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [maxTime, setMaxTime] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchEEGData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<EEGData>(`${API_BASE_URL}/api/eeg-data`);
      const { labels, data } = response.data;

      const time = Array.from({ length: data[0].length }, (_, i) => i / 100);
      setMaxTime(Math.max(...time));

      const eegSignals = data.map((signal, index) => ({
        x: time,
        y: signal,
        mode: 'lines',
        name: labels[index],
        line: {
          width: 1.5,
        },
      }));

      setEegData(eegSignals);
      await fetchHeatmap(timePoint);

      const eeg3DResponse = await axios.get(`${API_BASE_URL}/api/eeg-3d/0.1`, {
        responseType: 'blob',
      });
      const eeg3DUrl = URL.createObjectURL(eeg3DResponse.data);
      setEeg3DImage(eeg3DUrl);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching EEG data:', error);
      setLoading(false);
    }
  }, [timePoint]);

  const fetchHeatmap = async (time: number) => {
    try {
      const heatmapResponse = await axios.get(
        `${API_BASE_URL}/api/eeg-heatmap/${time}`,
        { responseType: 'blob' }
      );
      const heatmapUrl = URL.createObjectURL(heatmapResponse.data);
      setHeatmap(heatmapUrl);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    }
  };

  useEffect(() => {
    fetchEEGData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setTimePoint((prevTime) => {
          const newTime = prevTime + 0.1;
          if (newTime > maxTime) {
            setIsPlaying(false);
            return 0.01;
          }
          fetchHeatmap(newTime);
          return newTime;
        });
      }, 400);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxTime]);

  const handlePlotClick = (data: any) => {
    if (data.points && data.points.length > 0) {
      const clickedTime = data.points[0].x;
      setTimePoint(clickedTime);
      fetchHeatmap(clickedTime);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setTimePoint(newTime);
    fetchHeatmap(newTime);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Encephalic
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border-slate-700"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - EEG Plot */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-white">EEG Signal Analysis</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Time: {timePoint.toFixed(2)}s</span>
                    <Button
                      onClick={togglePlayPause}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  Interactive EEG waveform visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!loading && eegData.length > 0 ? (
                  <div className="rounded-lg overflow-hidden">
                    <Plot
                      data={eegData}
                      layout={{
                        autosize: true,
                        height: 500,
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(15, 23, 42, 0.5)',
                        font: { color: '#e2e8f0' },
                        xaxis: {
                          title: 'Time (s)',
                          gridcolor: '#334155',
                          showline: true,
                          linecolor: '#475569',
                        },
                        yaxis: {
                          title: 'Amplitude (µV)',
                          gridcolor: '#334155',
                          showline: true,
                          linecolor: '#475569',
                        },
                        margin: { l: 60, r: 40, t: 40, b: 60 },
                        hovermode: 'closest',
                        showlegend: true,
                        legend: {
                          x: 1.05,
                          y: 1,
                          bgcolor: 'rgba(15, 23, 42, 0.8)',
                          bordercolor: '#475569',
                          borderwidth: 1,
                        },
                      }}
                      config={{ responsive: true, displayModeBar: false }}
                      onClick={handlePlotClick}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="h-[500px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Zap className="h-12 w-12 text-blue-400 animate-pulse" />
                      <p className="text-slate-400">Loading EEG data...</p>
                    </div>
                  </div>
                )}

                {/* Time Slider */}
                <div className="mt-6 space-y-2">
                  <label className="text-sm text-slate-400">Timeline Control</label>
                  <Slider
                    value={[timePoint]}
                    min={0}
                    max={maxTime}
                    step={0.01}
                    onValueChange={handleSliderChange}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Brain Maps */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-white">Brain Activity Maps</CardTitle>
                </div>
                <CardDescription className="text-slate-400">
                  Spatial brain activity visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="topography" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
                    <TabsTrigger value="topography">Topography</TabsTrigger>
                    <TabsTrigger value="3d">3D Map</TabsTrigger>
                  </TabsList>

                  <TabsContent value="topography" className="mt-4">
                    {heatmap ? (
                      <div className="rounded-lg overflow-hidden border border-slate-700">
                        <img
                          src={heatmap}
                          alt="EEG Topography"
                          className="w-full h-auto"
                        />
                      </div>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center border border-slate-700 rounded-lg">
                        <p className="text-slate-400">Loading topography...</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="3d" className="mt-4">
                    {eeg3DImage ? (
                      <div className="rounded-lg overflow-hidden border border-slate-700">
                        <img
                          src={eeg3DImage}
                          alt="3D Brain Map"
                          className="w-full h-auto"
                        />
                      </div>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center border border-slate-700 rounded-lg">
                        <p className="text-slate-400">Loading 3D map...</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Channels</span>
                  <span className="text-sm font-semibold text-white">{eegData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Duration</span>
                  <span className="text-sm font-semibold text-white">{maxTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span className="text-sm font-semibold text-white">
                      {isPlaying ? 'Playing' : 'Paused'}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
