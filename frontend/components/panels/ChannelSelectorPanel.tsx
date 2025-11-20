/**
 * Channel Selector Panel - Interactive channel selection with anatomical presets
 */
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Square, Brain, Eye, Ear, Hand, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChannelSelectorPanelProps {
  channels: string[]
  selectedChannels: string[]
  onChannelToggle: (channel: string) => void
  onPresetSelect: (channels: string[]) => void
  loading?: boolean
}

// Anatomical channel presets for education
const CHANNEL_PRESETS = {
  frontal: {
    name: 'Frontal',
    icon: Brain,
    description: 'Executive functions, decision making',
    channels: ['Fp1', 'Fp2', 'F3', 'F4', 'F7', 'F8', 'Fz']
  },
  central: {
    name: 'Central',
    icon: Hand,
    description: 'Motor cortex, movement',
    channels: ['C3', 'C4', 'Cz']
  },
  temporal: {
    name: 'Temporal',
    icon: Ear,
    description: 'Auditory processing, memory',
    channels: ['T3', 'T4', 'T5', 'T6']
  },
  parietal: {
    name: 'Parietal',
    icon: Hand,
    description: 'Sensory processing, spatial awareness',
    channels: ['P3', 'P4', 'Pz']
  },
  occipital: {
    name: 'Occipital',
    icon: Eye,
    description: 'Visual processing',
    channels: ['O1', 'O2']
  }
}

export function ChannelSelectorPanel({
  channels,
  selectedChannels,
  onChannelToggle,
  onPresetSelect,
  loading = false
}: ChannelSelectorPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredChannels = channels.filter(ch =>
    ch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePresetClick = (presetKey: string) => {
    const preset = CHANNEL_PRESETS[presetKey as keyof typeof CHANNEL_PRESETS]
    const matchingChannels = channels.filter(ch =>
      preset.channels.some(pc => ch.includes(pc))
    )
    onPresetSelect(matchingChannels)
  }

  const handleSelectAll = () => {
    onPresetSelect(channels)
  }

  const handleDeselectAll = () => {
    onPresetSelect([])
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/30 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Channel Selection
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select EEG channels by region
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedChannels.length}/{channels.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading channels...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="flex-1 text-xs"
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeselectAll}
                className="flex-1 text-xs"
              >
                Clear
              </Button>
            </div>

            {/* Anatomical Presets */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Anatomical Regions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CHANNEL_PRESETS).map(([key, preset]) => {
                  const Icon = preset.icon
                  return (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      onClick={() => handlePresetClick(key)}
                      className="flex items-center gap-2 h-auto py-2 px-3 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                      title={preset.description}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Channel List */}
            <ScrollArea className="h-64 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="p-2 space-y-1">
                {filteredChannels.map((channel) => {
                  const isSelected = selectedChannels.includes(channel)
                  return (
                    <button
                      key={channel}
                      onClick={() => onChannelToggle(channel)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                        isSelected
                          ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-mono">{channel}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Educational Note */}
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="font-semibold mb-1">💡 Educational Tip:</p>
              <p>Different brain regions show distinct EEG patterns. Frontal regions relate to cognition, occipital to vision, and temporal to memory.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
