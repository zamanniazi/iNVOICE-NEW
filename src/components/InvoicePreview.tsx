import React from 'react';
import { Printer, Download, Building2, User, CheckCircle2 } from 'lucide-react';
import { ColumnLabels, InvoiceData } from '../types';
import { DEFAULT_COLUMN_LABELS } from '../data/constants';
import { 
  calculateTotalPieces,
  calculateItemTotal, 
  calculateSubtotal, 
  calculateTaxAmount, 
  getInvoiceDiscountAmount,
  calculateGrandTotal, 
  formatCurrency,
  exportInvoiceToCSV
} from '../utils/calculations';

interface InvoicePreviewProps {
  invoice: InvoiceData;
  onPrint: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  onPrint,
}) => {
  const labels: ColumnLabels = {
    ...DEFAULT_COLUMN_LABELS,
    ...(invoice.columnLabels || {}),
  };
  const subtotal = calculateSubtotal(invoice.items);
  const taxAmount = calculateTaxAmount(subtotal, invoice.taxRate);
  const discountAmount = getInvoiceDiscountAmount(invoice, subtotal);
  const grandTotal = calculateGrandTotal(subtotal, taxAmount, discountAmount);

  return (
    <div className="space-y-4">
      
      {/* Action header above preview (hidden on print) */}
      <div className="no-print flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-stone-700">Ready to Print &amp; Send</span>
          <span className="text-xs text-stone-400">| A4 / Letter formatted</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportInvoiceToCSV(invoice)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1.5"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Download CSV</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-950" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* The Actual Invoice Document Sheet */}
      <div 
        id="printable-invoice"
        className="print-only-target bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-10 text-stone-900 min-h-[750px] flex flex-col justify-between"
      >
        <div>
          {/* Top Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b-2 border-stone-800">
            {/* Company Info */}
            <div className="space-y-2 max-w-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-black text-base shadow-xs">
                  {invoice.company.name ? invoice.company.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight">
                  {invoice.company.name || 'Company Name'}
                </h1>
              </div>

              <div className="text-xs text-stone-600 space-y-0.5 pt-1 leading-relaxed">
                {invoice.company.address && <p>{invoice.company.address}</p>}
                <div className="flex flex-wrap gap-x-3 text-stone-500">
                  {invoice.company.email && <p>{invoice.company.email}</p>}
                  {invoice.company.phone && <p>{invoice.company.phone}</p>}
                </div>
                {invoice.company.taxId && (
                  <p className="text-stone-400 font-mono text-[11px]">Tax ID: {invoice.company.taxId}</p>
                )}
              </div>
            </div>

            {/* Document Title & Reference */}
            <div className="sm:text-right space-y-1.5 self-stretch sm:self-auto">
              <span className="text-2xl sm:text-3xl font-black text-stone-950 tracking-wider block">
                INVOICE
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex sm:justify-end gap-2 text-stone-600">
                  <span className="font-semibold text-stone-500">Invoice #:</span>
                  <span className="font-mono font-bold text-stone-900">{invoice.invoiceNumber || 'INV-001'}</span>
                </div>
                <div className="flex sm:justify-end gap-2 text-stone-600">
                  <span className="font-semibold text-stone-500">Date:</span>
                  <span>{invoice.issueDate}</span>
                </div>
                <div className="flex sm:justify-end gap-2 text-stone-600">
                  <span className="font-semibold text-stone-500">Due Date:</span>
                  <span className="font-medium text-stone-900">{invoice.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To / Customer Details */}
          <div className="py-6 border-b border-stone-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Billed To Customer
            </p>
            <h2 className="text-base sm:text-lg font-extrabold text-stone-900">
              {invoice.customer.name || 'Customer Name'}
            </h2>
            <div className="text-xs text-stone-600 space-y-0.5 mt-1 leading-relaxed">
              {invoice.customer.address && <p>{invoice.customer.address}</p>}
              <div className="flex flex-wrap gap-x-3 text-stone-500">
                {invoice.customer.email && <p>{invoice.customer.email}</p>}
                {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
              </div>
            </div>
          </div>

          {/* Table of Values / Items */}
          <div className="pt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3 px-2 w-8 text-center">#</th>
                  <th className="py-3 px-2">{labels.description}</th>
                  <th className="py-3 px-2 text-right w-24">{labels.unitPrice}</th>
                  <th className="py-3 px-2 text-center w-28">{labels.pieces} &times; {labels.quantity}</th>
                  <th className="py-3 px-2 text-right w-24">{labels.totalPieces}</th>
                  <th className="py-3 px-2 text-right w-28">{labels.finalPrice}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs sm:text-sm">
                {invoice.items.map((item, idx) => {
                  const mult = item.multiplier !== undefined && item.multiplier !== null ? item.multiplier : 1;
                  const totalPieces = calculateTotalPieces(item);
                  const lineTotal = calculateItemTotal(item);
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-2 text-center text-stone-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-2 font-medium text-stone-900">
                        {item.name ? item.name : <span className="italic text-stone-400">Unnamed Item</span>}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-stone-700">
                        {formatCurrency(item.unitPrice, invoice.currencySymbol)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-stone-600">
                        {item.quantity} &times; {mult}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-stone-800">
                        {totalPieces}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-stone-950">
                        {formatCurrency(lineTotal, invoice.currencySymbol)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculation & Total at the End */}
          <div className="pt-6 border-t-2 border-stone-800 flex flex-col sm:flex-row justify-between items-start gap-6">
            
            {/* Payment instructions / terms */}
            <div className="space-y-3 max-w-sm text-xs">
              {invoice.paymentTerms && (
                <div>
                  <p className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Payment Instructions</p>
                  <p className="text-stone-600 whitespace-pre-line mt-1">{invoice.paymentTerms}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <p className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Notes</p>
                  <p className="text-stone-600 whitespace-pre-line mt-1">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Totals Box */}
            <div className="w-full sm:w-72 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-stone-800">
                  {formatCurrency(subtotal, invoice.currencySymbol)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>
                    Discount{invoice.discountType === 'percent' && invoice.discountRate > 0 ? ` (${invoice.discountRate}%)` : ''}:
                  </span>
                  <span className="font-mono font-semibold">
                    -{formatCurrency(discountAmount, invoice.currencySymbol)}
                  </span>
                </div>
              )}

              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span className="font-mono font-semibold text-stone-800">
                    +{formatCurrency(taxAmount, invoice.currencySymbol)}
                  </span>
                </div>
              )}

              {/* Total at the End */}
              <div className="pt-3 border-t-2 border-stone-900 flex justify-between items-baseline">
                <div>
                  <span className="text-sm sm:text-base font-extrabold text-stone-950 uppercase tracking-tight block">
                    Total:
                  </span>
                  <span className="text-[10px] text-stone-400">Total at the end</span>
                </div>
                <span className="text-xl sm:text-2xl font-black font-mono text-stone-950">
                  {formatCurrency(grandTotal, invoice.currencySymbol)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-10 mt-8 border-t border-stone-200 text-center text-xs text-stone-400">
          <p>Thank you for your business!</p>
        </div>
      </div>

    </div>
  );
};
