/**
 * Filter Controls Panel - Interactive signal filtering
 */
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, Waves, Zap, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

interface FilterControlsPanelProps {
  onFilterApply?: (filterType: string, lowFreq: number, highFreq: number) => void
  loading?: boolean
}

export function FilterControlsPanel({ onFilterApply, loading = false }: FilterControlsPanelProps) {
  const [filterType, setFilterType] = useState<'bandpass' | 'highpass' | 'lowpass'>('bandpass')
  const [lowFreq, setLowFreq] = useState(1)
  const [highFreq, setHighFreq] = useState(40)
  const [previewEnabled, setPreviewEnabled] = useState(false)

  const filterPresets = [
    { name: 'Delta (0.5-4 Hz)', low: 0.5, high: 4, desc: 'Deep sleep, unconscious' },
    { name: 'Theta (4-8 Hz)', low: 4, high: 8, desc: 'Drowsiness, meditation' },
    { name: 'Alpha (8-13 Hz)', low: 8, high: 13, desc: 'Relaxed, eyes closed' },
    { name: 'Beta (13-30 Hz)', low: 13, high: 30, desc: 'Alert, active thinking' },
    { name: 'Gamma (30-100 Hz)', low: 30, high: 100, desc: 'Cognitive processing' }
  ]

  const handlePresetClick = (low: number, high: number) => {
    setLowFreq(low)
    setHighFreq(high)
    setFilterType('bandpass')
  }

  const handleApplyFilter = () => {
    if (onFilterApply) {
      onFilterApply(filterType, lowFreq, highFreq)
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-lg">
              <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Filter Controls
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Advanced signal filtering
              </p>
            </div>
          </div>
          <Badge variant={previewEnabled ? 'default' : 'secondary'} className="text-xs">
            {previewEnabled ? 'Preview ON' : 'Preview OFF'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Applying filter...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter Type Selection */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Filter Type
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'bandpass', label: 'Bandpass', icon: Waves },
                  { type: 'highpass', label: 'Highpass', icon: TrendingUp },
                  { type: 'lowpass', label: 'Lowpass', icon: Zap }
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.type}
                      onClick={() => setFilterType(option.type as any)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        filterType === option.type
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        filterType === option.type
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400'
                      }`} />
                      <span className="text-xs font-semibold">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Frequency Controls */}
            <div className="space-y-3">
              {(filterType === 'bandpass' || filterType === 'highpass') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Low Frequency
                    </label>
                    <Badge variant="outline" className="text-xs font-mono">
                      {lowFreq.toFixed(1)} Hz
                    </Badge>
                  </div>
                  <Slider
                    value={[lowFreq]}
                    onValueChange={(val) => setLowFreq(val[0])}
                    min={0.1}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}

              {(filterType === 'bandpass' || filterType === 'lowpass') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      High Frequency
                    </label>
                    <Badge variant="outline" className="text-xs font-mono">
                      {highFreq.toFixed(1)} Hz
                    </Badge>
                  </div>
                  <Slider
                    value={[highFreq]}
                    onValueChange={(val) => setHighFreq(val[0])}
                    min={0.1}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Brain Wave Presets */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Brain Wave Presets
              </h4>
              <div className="space-y-2">
                {filterPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetClick(preset.low, preset.high)}
                    className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {preset.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {preset.desc}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Apply
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setPreviewEnabled(!previewEnabled)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                {previewEnabled ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                onClick={handleApplyFilter}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                size="sm"
              >
                Apply Filter
              </Button>
            </div>

            {/* Educational Note */}
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <p className="font-semibold mb-1">🧠 Filter Guide:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li><strong>Bandpass:</strong> Isolate specific frequency range</li>
                <li><strong>Highpass:</strong> Remove slow drifts (DC offset)</li>
                <li><strong>Lowpass:</strong> Remove high-frequency noise</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
