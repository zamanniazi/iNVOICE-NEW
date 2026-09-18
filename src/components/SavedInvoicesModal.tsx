import React from 'react';
import { X, FolderOpen, Trash2, ArrowRight, PlusCircle, Calendar, DollarSign, Building, User } from 'lucide-react';
import { InvoiceData } from '../types';
import { calculateSubtotal, calculateTaxAmount, calculateDiscountAmount, calculateGrandTotal, formatCurrency } from '../utils/calculations';

interface SavedInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedInvoices: InvoiceData[];
  onLoadInvoice: (invoice: InvoiceData) => void;
  onDeleteInvoice: (id: string) => void;
  onNewInvoice: () => void;
}

export const SavedInvoicesModal: React.FC<SavedInvoicesModalProps> = ({
  isOpen,
  onClose,
  savedInvoices,
  onLoadInvoice,
  onDeleteInvoice,
  onNewInvoice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Saved Invoices</h2>
              <p className="text-xs text-stone-500">
                {savedInvoices.length} {savedInvoices.length === 1 ? 'invoice' : 'invoices'} saved in your browser
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoices List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {savedInvoices.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-700">No saved invoices yet</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Click the &ldquo;Save&rdquo; button in the header bar to save your active invoice anytime.
              </p>
              <button
                type="button"
                onClick={() => {
                  onNewInvoice();
                  onClose();
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Invoice</span>
              </button>
            </div>
          ) : (
            savedInvoices.map((inv) => {
              const subtotal = calculateSubtotal(inv.items);
              const tax = calculateTaxAmount(subtotal, inv.taxRate);
              const discount = calculateDiscountAmount(subtotal, inv.discountRate);
              const total = calculateGrandTotal(subtotal, tax, discount);

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-xs bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs text-stone-500">
                        {inv.issueDate}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-700 pt-0.5">
                      <span className="font-semibold text-stone-900 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-stone-400" />
                        {inv.company.name || 'Untitled Company'}
                      </span>
                      <span className="text-stone-400">&bull;</span>
                      <span className="text-stone-600 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {inv.customer.name || 'Untitled Customer'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400">
                      {inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-right sm:pr-2">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Total</span>
                      <span className="font-mono font-bold text-sm text-stone-950">
                        {formatCurrency(total, inv.currencySymbol)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadInvoice(inv);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Load this invoice into editor"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteInvoice(inv.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete this saved invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onNewInvoice();
              onClose();
            }}
            className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Brand New Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
