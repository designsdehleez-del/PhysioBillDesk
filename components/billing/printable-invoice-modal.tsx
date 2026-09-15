'use client'

import React from 'react'
import { Printer, Download, Stethoscope, Building2, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StoredVisit, exportSingleBillToExcel } from '@/lib/data-store'

interface PrintableInvoiceModalProps {
  visit: StoredVisit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrintableInvoiceModal({ visit, open, onOpenChange }: PrintableInvoiceModalProps) {
  if (!visit) return null

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.print()
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${visit.bill_number} - ${visit.patient_name}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #fff;
            padding: 24px;
            font-size: 13px;
            line-height: 1.4;
          }
          .invoice-card {
            max-width: 780px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            padding: 32px;
            border-radius: 8px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 800;
            color: #1e40af;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            font-size: 11px;
            color: #4b5563;
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .centre-details {
            font-size: 12px;
            color: #4b5563;
            margin-top: 6px;
          }
          .invoice-tag {
            text-align: right;
          }
          .invoice-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            font-weight: 700;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 4px;
            margin-bottom: 6px;
          }
          .bill-meta {
            font-size: 12px;
            color: #374151;
          }
          .grid-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            background: #f9fafb;
            padding: 14px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #f3f4f6;
          }
          .section-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
          }
          .info-row {
            margin: 3px 0;
            font-size: 12px;
          }
          .info-label {
            font-weight: 600;
            color: #4b5563;
            display: inline-block;
            width: 90px;
          }
          .table-container {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #f3f4f6;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
          }
          .totals-table {
            width: 280px;
          }
          .totals-table td {
            padding: 4px 8px;
            border: none;
          }
          .grand-total {
            font-size: 15px;
            font-weight: 800;
            color: #1e40af;
            border-top: 2px solid #2563eb !important;
            padding-top: 6px !important;
          }
          .footer-section {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            border-top: 1px dashed #d1d5db;
            padding-top: 16px;
            margin-top: 16px;
          }
          .terms {
            font-size: 11px;
            color: #6b7280;
          }
          .signatory {
            text-align: center;
          }
          .sign-line {
            height: 40px;
            border-bottom: 1px solid #9ca3af;
            margin-bottom: 4px;
          }
          .sign-title {
            font-size: 11px;
            font-weight: 600;
            color: #4b5563;
          }
          @media print {
            body { padding: 0; background: transparent; }
            .invoice-card { border: none; padding: 0; }
            @page { margin: 15mm; size: auto; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div>
              <div class="brand-title">PHYSIONAUTICS</div>
              <div class="brand-subtitle">Specialized Physiotherapy & Rehabilitation Clinic</div>
              <div class="centre-details">
                <strong>${visit.centre_name || 'New Friends Colony, New Delhi'}</strong><br/>
                ${visit.centre_address || 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025'}<br/>
                ${visit.centre_phone ? 'Phone: ' + visit.centre_phone : 'Phone: 08383936905'}
              </div>
            </div>
            <div class="invoice-tag">
              <div class="invoice-badge">TAX INVOICE / RECEIPT</div>
              <div class="bill-meta">
                <strong>Invoice #:</strong> ${visit.bill_number}<br/>
                <strong>Date:</strong> ${formatDate(visit.visit_date)}<br/>
                <strong>Payment:</strong> ${visit.payment_mode} (${visit.payment_status})
              </div>
            </div>
          </div>

          <div class="grid-info">
            <div>
              <div class="section-title">Patient Details</div>
              <div class="info-row"><span class="info-label">Patient UID:</span> <strong>${visit.patient_uid}</strong></div>
              <div class="info-row"><span class="info-label">Full Name:</span> <strong>${visit.patient_name}</strong></div>
              <div class="info-row"><span class="info-label">Age / Gender:</span> ${visit.patient_age || '--'} Yrs / ${visit.patient_gender || '--'}</div>
              <div class="info-row"><span class="info-label">Phone:</span> ${visit.patient_phone || '--'}</div>
              ${visit.patient_address ? `<div class="info-row"><span class="info-label">Address:</span> ${visit.patient_address}</div>` : ''}
            </div>

            <div>
              <div class="section-title">Consultation & Care</div>
              <div class="info-row"><span class="info-label">Attending:</span> <strong>${visit.doctor_name ? 'Dr. ' + visit.doctor_name : 'Consultant Physiotherapist'}</strong></div>
              ${visit.doctor_specialization ? `<div class="info-row"><span class="info-label">Specialty:</span> ${visit.doctor_specialization}</div>` : ''}
              <div class="info-row"><span class="info-label">Clinic Branch:</span> ${visit.centre_name || 'New Friends Colony, New Delhi'}</div>
              ${visit.notes ? `<div class="info-row"><span class="info-label">Care Notes:</span> ${visit.notes}</div>` : ''}
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;" class="text-center">Sr</th>
                  <th>Service / Treatment Description</th>
                  <th style="width: 100px;" class="text-right">Rate</th>
                  <th style="width: 60px;" class="text-center">Qty</th>
                  <th style="width: 110px;" class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${visit.items.map((item, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td><strong>${item.service_name}</strong></td>
                    <td class="text-right">${formatCurrency(item.price)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right"><strong>${formatCurrency(item.price * item.quantity)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>Subtotal:</td>
                <td class="text-right">${formatCurrency(visit.subtotal)}</td>
              </tr>
              ${visit.discount > 0 ? `
                <tr style="color: #dc2626;">
                  <td>Discount ${visit.discount_preset_name ? '(' + visit.discount_preset_name + ')' : ''}:</td>
                  <td class="text-right">- ${formatCurrency(visit.discount)}</td>
                </tr>
              ` : ''}
              <tr>
                <td class="grand-total">NET TOTAL:</td>
                <td class="text-right grand-total">${formatCurrency(visit.total)}</td>
              </tr>
            </table>
          </div>

          <div class="footer-section">
            <div class="terms">
              <strong>Patient Instructions & Remarks:</strong>
              <p style="margin-top: 4px;">• This is a computer generated medical invoice and receipt.<br/>
              • Kindly retain this receipt for follow-up consultations and insurance claim verification.<br/>
              • Physionautics wishes you a speedy and holistic recovery.</p>
            </div>
            <div class="signatory">
              <div class="sign-line"></div>
              <div class="sign-title">Authorized Signatory</div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">Physionautics Billing Desk</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 border-b bg-gray-50/80 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Patient Tax Invoice & Receipt
            </DialogTitle>
            <DialogDescription className="text-xs">
              Structured printable bill for UID: <span className="font-mono font-semibold text-blue-600">{visit.patient_uid}</span>
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => exportSingleBillToExcel(visit)}>
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Excel
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" /> Print Invoice
            </Button>
          </div>
        </DialogHeader>

        {/* Printable View Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-blue-900 tracking-tight">PHYSIONAUTICS</h2>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Physiotherapy & Pain Rehabilitation</p>
              <p className="text-xs text-gray-600 mt-1 font-medium">{visit.centre_name || 'New Friends Colony, New Delhi'}</p>
              <p className="text-xs text-muted-foreground">{visit.centre_address || 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025'}</p>
            </div>
            <div className="text-right space-y-1">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-mono font-bold">
                {visit.bill_number}
              </Badge>
              <p className="text-xs text-muted-foreground">Date: <span className="font-semibold text-gray-800">{formatDate(visit.visit_date)}</span></p>
              <p className="text-xs text-muted-foreground">Mode: <Badge variant="outline" className="text-[10px] ml-1 font-semibold">{visit.payment_mode}</Badge></p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                <User className="h-3 w-3 text-blue-600" /> Patient Information
              </p>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">Patient UID:</span>
                <span className="font-mono font-bold text-blue-700">{visit.patient_uid}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-semibold text-gray-900">{visit.patient_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Age / Gender:</span>
                <span>{visit.patient_age || '--'} Yrs / {visit.patient_gender || '--'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Phone:</span>
                <span>{visit.patient_phone || '--'}</span>
              </div>
              {visit.patient_address && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="truncate max-w-[180px]">{visit.patient_address}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-purple-600" /> Attending Doctor & Centre
              </p>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-semibold text-gray-900">{visit.doctor_name ? `Dr. ${visit.doctor_name}` : 'Consultant'}</span>
              </div>
              {visit.doctor_specialization && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Specialty:</span>
                  <span className="text-muted-foreground">{visit.doctor_specialization}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Centre:</span>
                <span className="font-medium text-gray-800">{visit.centre_name || 'New Friends Colony, New Delhi'}</span>
              </div>
              {visit.notes && (
                <div className="text-xs pt-1 text-muted-foreground bg-white/70 p-1.5 rounded border">
                  <span className="font-medium text-gray-700">Note: </span>{visit.notes}
                </div>
              )}
            </div>
          </div>

          {/* Charges Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100/80 border-b">
                <tr className="text-left text-gray-700 font-semibold">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Service / Procedure Description</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visit.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 font-semibold text-gray-900">{item.service_name}</td>
                    <td className="p-3 text-right text-muted-foreground">{formatCurrency(item.price)}</td>
                    <td className="p-3 text-center font-medium">{item.quantity}</td>
                    <td className="p-3 text-right font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Discount Summary */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 p-3 bg-gray-50/80 rounded-xl border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(visit.subtotal)}</span>
              </div>
              {visit.discount > 0 && (
                <div className="flex justify-between text-xs text-red-600">
                  <span>Discount {visit.discount_preset_name ? `(${visit.discount_preset_name})` : ''}:</span>
                  <span className="font-semibold">- {formatCurrency(visit.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-blue-900 border-t pt-2">
                <span>Net Total Paid:</span>
                <span>{formatCurrency(visit.total)}</span>
              </div>
            </div>
          </div>

          {/* Signatory & Notes */}
          <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-muted-foreground">
            <div className="space-y-1">
              <p className="font-semibold text-gray-700">Thank you for visiting Physionautics!</p>
              <p className="text-[11px] leading-relaxed">
                Computerized receipt generated for patient UID {visit.patient_uid}.<br />
                Valid for consultations, rehabilitation follow-ups, and corporate claim reimbursements.
              </p>
            </div>
            <div className="text-center sm:text-right min-w-[160px]">
              <div className="h-10 border-b border-gray-400 w-36 mx-auto sm:ml-auto" />
              <p className="text-[11px] font-bold text-gray-800 mt-1">Authorized Signatory</p>
              <p className="text-[10px] text-muted-foreground">Physionautics Clinic Desk</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
