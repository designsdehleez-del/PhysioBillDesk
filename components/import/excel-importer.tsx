'use client'
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface ColumnDefinition {
  key: string
  label: string
  required?: boolean
  example?: string | number
}

interface ExcelImporterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  templateFileName: string
  columns: ColumnDefinition[]
  sampleRows?: Record<string, any>[]
  onImport: (rows: Record<string, any>[]) => Promise<void>
}

export function ExcelImporter({
  open,
  onOpenChange,
  title,
  description,
  templateFileName,
  columns,
  sampleRows,
  onImport,
}: ExcelImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const downloadTemplate = () => {
    const headers: Record<string, any> = {}
    columns.forEach(col => {
      headers[col.label] = col.example || (col.required ? 'Required value' : 'Optional')
    })

    const data = sampleRows && sampleRows.length > 0
      ? sampleRows.map(row => {
          const formatted: Record<string, any> = {}
          columns.forEach(col => {
            formatted[col.label] = row[col.key] ?? col.example ?? ''
          })
          return formatted
        })
      : [headers]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, `${templateFileName}_template.xlsx`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(ws)

        if (rawData.length === 0) {
          setErrorMsg('The selected spreadsheet appears to be empty.')
          return
        }

        // Map column labels to keys
        const mapped = rawData.map(rawRow => {
          const row: Record<string, any> = {}
          columns.forEach(col => {
            // Find key either by exact label or close match
            const matchingHeader = Object.keys(rawRow).find(
              h => h.trim().toLowerCase() === col.label.trim().toLowerCase() ||
                   h.trim().toLowerCase() === col.key.trim().toLowerCase()
            )
            row[col.key] = matchingHeader ? rawRow[matchingHeader] : undefined
          })
          return row
        })

        setParsedRows(mapped)
      } catch (err: any) {
        setErrorMsg('Failed to parse spreadsheet. Please ensure it is a valid .xlsx or .csv file.')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleConfirm = async () => {
    if (parsedRows.length === 0) return
    setIsProcessing(true)
    try {
      await onImport(parsedRows)
      handleClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed. Please verify data format.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setParsedRows([])
    setFileName(null)
    setErrorMsg(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto flex-1">
          {/* Step 1: Download Template */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/60 border-emerald-200">
            <div>
              <p className="text-xs font-bold text-emerald-900">Step 1: Download Pre-Formatted Template</p>
              <p className="text-[11px] text-emerald-700">Get the exact column structure for error-free bulk upload</p>
            </div>
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 gap-1.5" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" /> Download Template
            </Button>
          </div>

          {/* Step 2: Upload File Dropzone */}
          <div 
            className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-gray-50/80 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">
              {fileName ? fileName : 'Click to select Excel (.xlsx) or CSV file'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Supports Microsoft Excel (.xlsx, .xls) and CSV</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 3: Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-900">
                  Preview Ready ({parsedRows.length} records ready for import)
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Validated
                </Badge>
              </div>

              <div className="border rounded-lg overflow-x-auto max-h-48 text-xs">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr className="text-left text-muted-foreground">
                      <th className="p-2">#</th>
                      {columns.slice(0, 4).map(c => (
                        <th key={c.key} className="p-2">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedRows.slice(0, 6).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60">
                        <td className="p-2 text-muted-foreground font-mono">{idx + 1}</td>
                        {columns.slice(0, 4).map(c => (
                          <td key={c.key} className="p-2 font-medium text-gray-800">
                            {row[c.key] ? String(row[c.key]) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 6 && (
                <p className="text-[11px] text-muted-foreground text-center">... and {parsedRows.length - 6} more rows</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3 flex justify-between sm:justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" 
            disabled={parsedRows.length === 0 || isProcessing} 
            onClick={handleConfirm}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirm & Import {parsedRows.length > 0 ? `(${parsedRows.length} Rows)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}