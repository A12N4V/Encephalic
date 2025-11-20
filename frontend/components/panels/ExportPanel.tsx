/**
 * Export Panel - Export visualizations and data
 */
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileImage, FileText, FileSpreadsheet, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ExportPanelProps {
  onExportPNG?: () => void
  onExportSVG?: () => void
  onExportCSV?: () => void
  onExportPDF?: () => void
}

export function ExportPanel({
  onExportPNG,
  onExportSVG,
  onExportCSV,
  onExportPDF
}: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null)
  const [exported, setExported] = useState<string | null>(null)

  const handleExport = async (format: string, callback?: () => void) => {
    setExporting(format)
    setExported(null)

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (callback) {
      callback()
    }

    setExporting(null)
    setExported(format)
    setTimeout(() => setExported(null), 2000)
  }

  const exportOptions = [
    {
      id: 'png',
      label: 'PNG Image',
      description: 'High-resolution bitmap',
      icon: FileImage,
      color: 'blue',
      callback: onExportPNG
    },
    {
      id: 'svg',
      label: 'SVG Vector',
      description: 'Scalable vector graphics',
      icon: FileImage,
      color: 'purple',
      callback: onExportSVG
    },
    {
      id: 'csv',
      label: 'CSV Data',
      description: 'Comma-separated values',
      icon: FileSpreadsheet,
      color: 'emerald',
      callback: onExportCSV
    },
    {
      id: 'pdf',
      label: 'PDF Report',
      description: 'Complete analysis report',
      icon: FileText,
      color: 'red',
      callback: onExportPDF
    }
  ]

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Export & Share
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Download visualizations and data
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {exportOptions.map((option) => {
            const Icon = option.icon
            const isExporting = exporting === option.id
            const isExported = exported === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleExport(option.id, option.callback)}
                disabled={isExporting}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  isExported
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : `border-${option.color}-200 dark:border-${option.color}-800 hover:border-${option.color}-400 dark:hover:border-${option.color}-600 bg-${option.color}-50/50 dark:bg-${option.color}-950/20`
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`p-2 rounded-lg bg-${option.color}-100 dark:bg-${option.color}-950/50`}>
                  {isExporting ? (
                    <Loader2 className={`w-5 h-5 text-${option.color}-600 dark:text-${option.color}-400 animate-spin`} />
                  ) : isExported ? (
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className={`w-5 h-5 text-${option.color}-600 dark:text-${option.color}-400`} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {option.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isExporting ? 'Exporting...' : isExported ? 'Downloaded!' : option.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {option.id.toUpperCase()}
                </Badge>
              </button>
            )
          })}
        </div>

        {/* Export Settings */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Export Settings
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 dark:border-slate-700"
              />
              <span className="text-slate-600 dark:text-slate-400">Include metadata</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 dark:border-slate-700"
              />
              <span className="text-slate-600 dark:text-slate-400">High resolution (300 DPI)</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="rounded border-slate-300 dark:border-slate-700"
              />
              <span className="text-slate-600 dark:text-slate-400">Include timestamp</span>
            </label>
          </div>
        </div>

        {/* Educational Note */}
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="font-semibold mb-1">💡 Export Tips:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>PNG for presentations and publications</li>
            <li>SVG for editing in vector graphics software</li>
            <li>CSV for further analysis in Python/R/MATLAB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
