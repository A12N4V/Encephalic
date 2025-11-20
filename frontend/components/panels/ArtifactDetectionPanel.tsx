/**
 * Artifact Detection Panel - Identify and visualize signal artifacts
 */
"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Eye, Zap, Activity, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ArtifactDetection {
  type: 'eye_blink' | 'muscle' | 'movement' | 'line_noise'
  channel: string
  time: number
  duration: number
  severity: 'low' | 'medium' | 'high'
}

interface ArtifactDetectionPanelProps {
  artifacts: ArtifactDetection[]
  loading: boolean
  onArtifactClick?: (artifact: ArtifactDetection) => void
}

const ARTIFACT_TYPES = {
  eye_blink: {
    label: 'Eye Blink',
    icon: Eye,
    color: 'blue',
    description: 'Ocular artifacts from blinking'
  },
  muscle: {
    label: 'Muscle Activity',
    icon: Activity,
    color: 'red',
    description: 'EMG contamination'
  },
  movement: {
    label: 'Movement',
    icon: Zap,
    color: 'orange',
    description: 'Motion artifacts'
  },
  line_noise: {
    label: 'Line Noise',
    icon: Zap,
    color: 'purple',
    description: '50/60 Hz electrical interference'
  }
}

export function ArtifactDetectionPanel({
  artifacts,
  loading,
  onArtifactClick
}: ArtifactDetectionPanelProps) {
  const artifactCounts = artifacts.reduce((acc, artifact) => {
    acc[artifact.type] = (acc[artifact.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-yellow-500'
      default: return 'bg-slate-500'
    }
  }

  const sortedArtifacts = [...artifacts].sort((a, b) => a.time - b.time)

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Artifact Detection
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatic artifact identification
              </p>
            </div>
          </div>
          <Badge variant={artifacts.length > 10 ? 'destructive' : 'secondary'} className="text-xs">
            {artifacts.length} detected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-red-600 dark:text-red-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Detecting artifacts...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Artifact Type Summary */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Artifact Summary
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ARTIFACT_TYPES).map(([type, info]) => {
                  const Icon = info.icon
                  const count = artifactCounts[type] || 0
                  return (
                    <div
                      key={type}
                      className={`p-3 rounded-lg border-2 ${
                        count > 0
                          ? `border-${info.color}-200 dark:border-${info.color}-800 bg-${info.color}-50/50 dark:bg-${info.color}-950/20`
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50'
                      }`}
                      title={info.description}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${
                          count > 0
                            ? `text-${info.color}-600 dark:text-${info.color}-400`
                            : 'text-slate-400'
                        }`} />
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {info.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {count}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detailed Artifact List */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Detected Artifacts
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {sortedArtifacts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">✨</div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                        No artifacts detected!
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Signal quality is excellent
                      </p>
                    </div>
                  ) : (
                    sortedArtifacts.map((artifact, idx) => {
                      const artifactInfo = ARTIFACT_TYPES[artifact.type]
                      const Icon = artifactInfo.icon
                      return (
                        <button
                          key={idx}
                          onClick={() => onArtifactClick?.(artifact)}
                          className="w-full flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 transition-all text-left group"
                        >
                          <div className={`p-2 rounded-lg bg-${artifactInfo.color}-100 dark:bg-${artifactInfo.color}-950/30`}>
                            <Icon className={`w-4 h-4 text-${artifactInfo.color}-600 dark:text-${artifactInfo.color}-400`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {artifactInfo.label}
                              </span>
                              <Badge variant="outline" className="text-xs font-mono">
                                {artifact.channel}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {artifact.time.toFixed(2)}s • {(artifact.duration * 1000).toFixed(0)}ms
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(artifact.severity)}`} />
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {artifact.severity}
                            </span>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Signal Quality Indicator */}
            <div className={`p-3 rounded-lg border-2 ${
              artifacts.length === 0
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20'
                : artifacts.length < 10
                ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20'
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${
                  artifacts.length === 0 ? 'bg-emerald-500' :
                  artifacts.length < 10 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs font-semibold">
                  Overall Signal Quality: {
                    artifacts.length === 0 ? 'Excellent' :
                    artifacts.length < 10 ? 'Good' : 'Poor'
                  }
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {artifacts.length === 0
                  ? 'No artifacts detected. Data is clean and ready for analysis.'
                  : artifacts.length < 10
                  ? 'Some artifacts present. Consider filtering or removing affected segments.'
                  : 'Many artifacts detected. Signal preprocessing recommended before analysis.'}
              </p>
            </div>

            {/* Educational Info */}
            <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="font-semibold mb-1">🔍 Artifact Detection:</p>
              <p>
                Artifacts are unwanted signals that contaminate EEG data. Common sources
                include eye movements, muscle activity, and electrical interference.
                Identifying and removing artifacts improves analysis accuracy.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
