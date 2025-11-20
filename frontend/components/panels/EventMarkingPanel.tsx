/**
 * Event Marking Panel - Annotate events on the timeline
 */
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, Plus, Trash2, Edit2, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Event {
  id: string
  time: number
  label: string
  type: 'stimulus' | 'response' | 'artifact' | 'custom'
  color: string
}

interface EventMarkingPanelProps {
  events: Event[]
  onAddEvent?: (event: Omit<Event, 'id'>) => void
  onDeleteEvent?: (id: string) => void
  onEditEvent?: (id: string, updates: Partial<Event>) => void
  currentTime?: number
}

const EVENT_TYPES = [
  { type: 'stimulus', label: 'Stimulus', color: '#3b82f6', icon: '⚡' },
  { type: 'response', label: 'Response', color: '#10b981', icon: '✓' },
  { type: 'artifact', label: 'Artifact', color: '#ef4444', icon: '⚠' },
  { type: 'custom', label: 'Custom', color: '#8b5cf6', icon: '📌' }
] as const

export function EventMarkingPanel({
  events,
  onAddEvent,
  onDeleteEvent,
  onEditEvent,
  currentTime = 0
}: EventMarkingPanelProps) {
  const [newEventLabel, setNewEventLabel] = useState('')
  const [selectedType, setSelectedType] = useState<Event['type']>('stimulus')

  const handleAddEvent = () => {
    if (!newEventLabel.trim() || !onAddEvent) return

    const eventType = EVENT_TYPES.find(t => t.type === selectedType)!
    onAddEvent({
      time: currentTime,
      label: newEventLabel,
      type: selectedType,
      color: eventType.color
    })

    setNewEventLabel('')
  }

  const sortedEvents = [...events].sort((a, b) => a.time - b.time)

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
              <Bookmark className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Event Markers
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Annotate timeline events
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {events.length} events
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div className="space-y-2">
          {/* Add Event Form */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Add Event at {currentTime.toFixed(2)}s
            </h4>

            {/* Event Type Selection */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={`p-2 rounded text-xs font-semibold transition-all ${
                    selectedType === type.type
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                  title={type.label}
                >
                  {type.icon}
                </button>
              ))}
            </div>

            {/* Event Label Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Event label..."
                value={newEventLabel}
                onChange={(e) => setNewEventLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEvent()}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button
                size="sm"
                onClick={handleAddEvent}
                disabled={!newEventLabel.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Event List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Marked Events
            </h4>
            <div>
              <div className="space-y-2">
                {sortedEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No events marked yet
                  </div>
                ) : (
                  sortedEvents.map((event) => {
                    const eventType = EVENT_TYPES.find(t => t.type === event.type)!
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors group"
                      >
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{eventType.icon}</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {event.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {event.time.toFixed(3)}s
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                            onClick={() => onEditEvent?.(event.id, event)}
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-950/30 rounded"
                            onClick={() => onDeleteEvent?.(event.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Educational Info */}
          <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
            <p className="font-semibold mb-1">💡 Event Marking Tips:</p>
            <p>
              Mark important timepoints like stimuli presentation, participant responses,
              or detected artifacts. Events help with ERP analysis and data quality control.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
