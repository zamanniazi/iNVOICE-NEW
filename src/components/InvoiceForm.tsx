import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Calculator, 
  Calendar, 
  Hash, 
  ChevronDown, 
  ChevronUp, 
  Percent, 
  FileText,
  RotateCcw,
  Sparkles,
  Save,
  ArrowRight,
  ShieldCheck,
  Check,
  Edit3,
  Tag
} from 'lucide-react';
import { ColumnLabels, InvoiceData, InvoiceItem } from '../types';
import { createEmptyItem, DEFAULT_COLUMN_LABELS } from '../data/constants';
import { 
  calculateTotalPieces,
  calculateItemTotal, 
  calculateSubtotal, 
  calculateTaxAmount, 
  getInvoiceDiscountAmount,
  calculateGrandTotal, 
  formatCurrency 
} from '../utils/calculations';

interface InvoiceFormProps {
  invoice: InvoiceData;
  onChange: (updated: InvoiceData) => void;
  onReset: () => void;
  onLoadSample: () => void;
  onSaveAndNext: () => void;
  onSaveExisting?: () => void;
  isEditingSaved?: boolean;
  hasSavedJustNow?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChange,
  onReset,
  onLoadSample,
  onSaveAndNext,
  onSaveExisting,
  isEditingSaved,
  hasSavedJustNow,
}) => {
  const [showMoreCompany, setShowMoreCompany] = useState(false);
  const [showMoreCustomer, setShowMoreCustomer] = useState(false);
  const [showMobileColEditor, setShowMobileColEditor] = useState(false);

  const labels: ColumnLabels = {
    ...DEFAULT_COLUMN_LABELS,
    ...(invoice.columnLabels || {}),
  };

  const handleColumnLabelChange = (field: keyof ColumnLabels, value: string) => {
    onChange({
      ...invoice,
      columnLabels: {
        ...labels,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const resetColumnLabels = () => {
    onChange({
      ...invoice,
      columnLabels: { ...DEFAULT_COLUMN_LABELS },
      updatedAt: new Date().toISOString(),
    });
  };

  // Line item handlers
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...invoice.items];
    const targetItem = { ...newItems[index] };

    if (field === 'unitPrice' || field === 'quantity' || field === 'multiplier') {
      const numVal = parseFloat(value as string);
      targetItem[field] = isNaN(numVal) ? 0 : numVal;
    } else {
      (targetItem[field] as any) = value;
    }

    newItems[index] = targetItem;
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const addItem = () => {
    const newItem = createEmptyItem();
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
      updatedAt: new Date().toISOString(),
    });
  };

  const addMultipleItems = (count: number) => {
    const newBatch = Array.from({ length: count }, () => createEmptyItem());
    onChange({
      ...invoice,
      items: [...invoice.items, ...newBatch],
      updatedAt: new Date().toISOString(),
    });
  };

  const duplicateItem = (index: number) => {
    const itemToCopy = invoice.items[index];
    const copy: InvoiceItem = {
      ...itemToCopy,
      id: 'item_' + Math.random().toString(36).substring(2, 9),
      name: `${itemToCopy.name} (Copy)`,
    };
    const newItems = [...invoice.items];
    newItems.splice(index + 1, 0, copy);
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const removeItem = (index: number) => {
    if (invoice.items.length <= 1) {
      // Keep at least one blank row instead of empty table
      onChange({
        ...invoice,
        items: [createEmptyItem()],
        updatedAt: new Date().toISOString(),
      });
      return;
    }
    const newItems = invoice.items.filter((_, i) => i !== index);
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= invoice.items.length) return;
    const newItems = [...invoice.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    onChange({
      ...invoice,
      items: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const clearAllItems = () => {
    onChange({
      ...invoice,
      items: [createEmptyItem()],
      updatedAt: new Date().toISOString(),
    });
  };

  // Calculations
  const subtotal = calculateSubtotal(invoice.items);
  const taxAmount = calculateTaxAmount(subtotal, invoice.taxRate);
  const discountType = invoice.discountType || 'amount';
  const discountAmount = getInvoiceDiscountAmount(invoice, subtotal);
  const grandTotal = calculateGrandTotal(subtotal, taxAmount, discountAmount);

  return (
    <div className="space-y-6">
      
      {/* Top Quick Bar: Sample / Reset & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isEditingSaved ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span className="text-xs font-semibold text-stone-700">
            {isEditingSaved ? 'Editing Saved Invoice' : 'Current Draft'}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-800 font-bold">
            #{invoice.invoiceNumber}
          </span>
          {isEditingSaved && (
            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
              Changes will update this saved record or you can save as new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1.5"
            title="Fill with professional sample data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            title="Clear and start new"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Primary Section: Company & Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Company Box */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs transition-all hover:border-stone-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">Company Details</h3>
                <p className="text-[11px] text-stone-500">Invoice sender / Seller</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMoreCompany(!showMoreCompany)}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
            >
              <span>{showMoreCompany ? 'Less details' : '+ More details'}</span>
              {showMoreCompany ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="company-name" className="block text-xs font-semibold text-stone-700 mb-1">
                Specific Name of Company <span className="text-red-500">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                value={invoice.company.name}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    company: { ...invoice.company, name: e.target.value },
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder="e.g. Apex Solutions Ltd."
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              />
            </div>

            {showMoreCompany && (
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="company-email" className="block text-[11px] font-medium text-stone-600 mb-1">
                      Company Email
                    </label>
                    <input
                      id="company-email"
                      type="email"
                      value={invoice.company.email || ''}
                      onChange={(e) =>
                        onChange({
                          ...invoice,
                          company: { ...invoice.company, email: e.target.value },
                        })
                      }
                      placeholder="billing@company.com"
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="company-phone" className="block text-[11px] font-medium text-stone-600 mb-1">
                      Company Phone
                    </label>
                    <input
                      id="company-phone"
                      type="text"
                      value={invoice.company.phone || ''}
                      onChange={(e) =>
                        onChange({
                          ...invoice,
                          company: { ...invoice.company, phone: e.target.value },
                        })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company-address" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Company Address
                  </label>
                  <input
                    id="company-address"
                    type="text"
                    value={invoice.company.address || ''}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        company: { ...invoice.company, address: e.target.value },
                      })
                    }
                    placeholder="Street, City, State, ZIP"
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="company-taxid" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Tax ID / VAT / Registration Number
                  </label>
                  <input
                    id="company-taxid"
                    type="text"
                    value={invoice.company.taxId || ''}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        company: { ...invoice.company, taxId: e.target.value },
                      })
                    }
                    placeholder="e.g. US-TAX-982104"
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Box */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs transition-all hover:border-stone-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">Customer Details</h3>
                <p className="text-[11px] text-stone-500">Bill to / Client</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMoreCustomer(!showMoreCustomer)}
              className="text-xs text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>{showMoreCustomer ? 'Less details' : '+ More details'}</span>
              {showMoreCustomer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="customer-name" className="block text-xs font-semibold text-stone-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={invoice.customer.name}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    customer: { ...invoice.customer, name: e.target.value },
                    updatedAt: new Date().toISOString(),
                  })
                }
                placeholder="e.g. Acme Corporation or John Doe"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-semibold text-stone-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {showMoreCustomer && (
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="customer-email" className="block text-[11px] font-medium text-stone-600 mb-1">
                      Customer Email
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      value={invoice.customer.email || ''}
                      onChange={(e) =>
                        onChange({
                          ...invoice,
                          customer: { ...invoice.customer, email: e.target.value },
                        })
                      }
                      placeholder="client@acme.com"
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="block text-[11px] font-medium text-stone-600 mb-1">
                      Customer Phone
                    </label>
                    <input
                      id="customer-phone"
                      type="text"
                      value={invoice.customer.phone || ''}
                      onChange={(e) =>
                        onChange({
                          ...invoice,
                          customer: { ...invoice.customer, phone: e.target.value },
                        })
                      }
                      placeholder="+1 (555) 111-2222"
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customer-address" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Billing Address
                  </label>
                  <input
                    id="customer-address"
                    type="text"
                    value={invoice.customer.address || ''}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        customer: { ...invoice.customer, address: e.target.value },
                      })
                    }
                    placeholder="Street, City, State, Country"
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Invoice Reference & Dates */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="invoice-number" className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-stone-400" />
              Invoice Number
            </label>
            <input
              id="invoice-number"
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  invoiceNumber: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              className="w-full px-3 py-1.5 text-xs font-mono font-medium bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="issue-date" className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Issue Date
            </label>
            <input
              id="issue-date"
              type="date"
              value={invoice.issueDate}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  issueDate: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="due-date" className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Due Date
            </label>
            <input
              id="due-date"
              type="date"
              value={invoice.dueDate}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  dueDate: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* CORE VALUES / LINE ITEMS SECTION (Unlimited entries with Auto Multiply) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Values &amp; Items (Unlimited Entries)</h3>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Click any column heading below to rename it (e.g. change <span className="font-semibold text-stone-700">&ldquo;Pieces&rdquo;</span> to <span className="font-semibold text-stone-700">&ldquo;Students&rdquo;</span> or <span className="font-semibold text-stone-700">&ldquo;Quantity&rdquo;</span> to <span className="font-semibold text-stone-700">&ldquo;Subjects&rdquo;</span>)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMobileColEditor(!showMobileColEditor)}
              className="md:hidden px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Column Names</span>
            </button>
            <button
              type="button"
              onClick={resetColumnLabels}
              className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              title="Reset column headings to default"
            >
              Reset Headings
            </button>
            <button
              type="button"
              onClick={() => addMultipleItems(5)}
              className="px-2.5 py-1 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              title="Add 5 blank rows at once"
            >
              + Add 5 Rows
            </button>
            {invoice.items.length > 1 && (
              <button
                type="button"
                onClick={clearAllItems}
                className="px-2.5 py-1 text-xs font-medium text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all rows"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Mobile Editable Column Headings Drawer */}
        {showMobileColEditor && (
          <div className="md:hidden p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Customize Column Headings
              </span>
              <button
                type="button"
                onClick={resetColumnLabels}
                className="text-[11px] text-amber-700 underline"
              >
                Reset Defaults
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Description Heading</label>
                <input
                  type="text"
                  value={labels.description}
                  onChange={(e) => handleColumnLabelChange('description', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-md font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Unit Price Heading</label>
                <input
                  type="text"
                  value={labels.unitPrice}
                  onChange={(e) => handleColumnLabelChange('unitPrice', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-md font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">First Multiplier (e.g. Pieces)</label>
                <input
                  type="text"
                  value={labels.pieces}
                  onChange={(e) => handleColumnLabelChange('pieces', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-md font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Second Multiplier (e.g. Quantity)</label>
                <input
                  type="text"
                  value={labels.quantity}
                  onChange={(e) => handleColumnLabelChange('quantity', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-md font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Total Pieces Label</label>
                <input
                  type="text"
                  value={labels.totalPieces}
                  onChange={(e) => handleColumnLabelChange('totalPieces', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-md font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Final Price Heading</label>
                <input
                  type="text"
                  value={labels.finalPrice}
                  onChange={(e) => handleColumnLabelChange('finalPrice', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-stone-300 rounded-md font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Items Table / Responsive Rows */}
        <div className="space-y-3">
          {/* Editable Header Row (Visible on tablet & desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-700 items-center border border-stone-200/80">
            <div className="col-span-1 text-center uppercase tracking-wider">#</div>
            <div className="col-span-3">
              <input
                type="text"
                value={labels.description}
                onChange={(e) => handleColumnLabelChange('description', e.target.value)}
                title="Click to edit column name"
                placeholder="Value Name / Description"
                className="w-full px-2 py-1 rounded-md bg-white/80 hover:bg-white focus:bg-white border border-dashed border-stone-300 focus:border-amber-500 text-xs font-bold text-stone-800 uppercase tracking-wider outline-none transition-colors"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={labels.unitPrice}
                onChange={(e) => handleColumnLabelChange('unitPrice', e.target.value)}
                title="Click to edit price column name"
                placeholder="One Piece Price"
                className="w-full px-2 py-1 rounded-md bg-white/80 hover:bg-white focus:bg-white border border-dashed border-stone-300 focus:border-amber-500 text-xs font-bold text-stone-800 uppercase tracking-wider text-right outline-none transition-colors"
              />
            </div>
            <div className="col-span-3">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={labels.pieces}
                  onChange={(e) => handleColumnLabelChange('pieces', e.target.value)}
                  title="Click to rename 'Pieces' (e.g. Students, Boxes, Sets)"
                  placeholder="Pieces"
                  className="w-full px-1.5 py-1 rounded-md bg-white/80 hover:bg-white focus:bg-white border border-dashed border-stone-300 focus:border-amber-500 text-[11px] font-bold text-stone-800 uppercase tracking-wider text-center outline-none transition-colors"
                />
                <span className="text-stone-400 font-black select-none">&times;</span>
                <input
                  type="text"
                  value={labels.quantity}
                  onChange={(e) => handleColumnLabelChange('quantity', e.target.value)}
                  title="Click to rename 'Quantity' (e.g. Subjects, Days, Qty)"
                  placeholder="Quantity"
                  className="w-full px-1.5 py-1 rounded-md bg-white/80 hover:bg-white focus:bg-white border border-dashed border-stone-300 focus:border-amber-500 text-[11px] font-bold text-stone-800 uppercase tracking-wider text-center outline-none transition-colors"
                />
                <span className="text-stone-400 font-black select-none">=</span>
                <input
                  type="text"
                  value={labels.totalPieces}
                  onChange={(e) => handleColumnLabelChange('totalPieces', e.target.value)}
                  title="Click to rename 'Total Pcs' (e.g. Total Papers, Total Units)"
                  placeholder="Total Pcs"
                  className="w-full px-1.5 py-1 rounded-md bg-emerald-50/90 hover:bg-white focus:bg-white border border-dashed border-emerald-300 focus:border-amber-500 text-[11px] font-bold text-emerald-900 uppercase tracking-wider text-center outline-none transition-colors"
                />
              </div>
            </div>
            <div className="col-span-2">
              <input
                type="text"
                value={labels.finalPrice}
                onChange={(e) => handleColumnLabelChange('finalPrice', e.target.value)}
                title="Click to edit final price column name"
                placeholder="Final Price"
                className="w-full px-2 py-1 rounded-md bg-white/80 hover:bg-white focus:bg-white border border-dashed border-stone-300 focus:border-amber-500 text-xs font-bold text-stone-800 uppercase tracking-wider text-right outline-none transition-colors"
              />
            </div>
            <div className="col-span-1 text-center uppercase tracking-wider">Actions</div>
          </div>

          {/* Line items list */}
          {invoice.items.map((item, index) => {
            const mult = item.multiplier !== undefined && item.multiplier !== null ? item.multiplier : 1;
            const totalPieces = calculateTotalPieces(item);
            const lineTotal = calculateItemTotal(item);

            return (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-xl bg-stone-50/70 border border-stone-200 hover:border-amber-300 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  
                  {/* Row Number & Mobile Header */}
                  <div className="md:col-span-1 flex items-center justify-between md:justify-center">
                    <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="md:hidden text-xs font-bold text-stone-500">
                      Line Item #{index + 1}
                    </span>
                    {/* Mobile auto-total preview */}
                    <span className="md:hidden font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {formatCurrency(lineTotal, invoice.currencySymbol)}
                    </span>
                  </div>

                  {/* Field 1: Value Name */}
                  <div className="md:col-span-3">
                    <label className="block md:hidden text-[11px] font-semibold text-stone-600 mb-1">
                      {labels.description}
                    </label>
                    <input
                      id={`item-name-${index}`}
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && index === invoice.items.length - 1) {
                          e.preventDefault();
                          addItem();
                        }
                      }}
                      placeholder={`Enter ${labels.description.toLowerCase()}...`}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  {/* Field 2: One Piece Price */}
                  <div className="md:col-span-2">
                    <label className="block md:hidden text-[11px] font-semibold text-stone-600 mb-1">
                      {labels.unitPrice} ({invoice.currencySymbol})
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-mono font-medium text-stone-400 pointer-events-none">
                        {invoice.currencySymbol}
                      </span>
                      <input
                        id={`item-price-${index}`}
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice === 0 && !item.name ? '' : item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-2.5 py-2 text-xs sm:text-sm font-mono text-right bg-white border border-stone-300 rounded-lg text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 3: Editable Pieces × Quantity = Total Pieces */}
                  <div className="md:col-span-3">
                    <label className="block md:hidden text-[11px] font-semibold text-stone-600 mb-1">
                      {labels.pieces} &times; {labels.quantity} = {labels.totalPieces}
                    </label>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {/* Pieces Input */}
                        <div className="flex-1">
                          <input
                            id={`item-qty-${index}`}
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder={labels.pieces}
                            title={labels.pieces}
                            className="w-full h-9 px-2 text-xs sm:text-sm font-mono text-center bg-white border border-stone-300 rounded-lg text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
                          />
                        </div>

                        <span className="text-xs font-bold text-stone-400 px-0.5 select-none" title="Multiplied by">
                          &times;
                        </span>

                        {/* Quantity / Multiplier Input */}
                        <div className="flex-1">
                          <input
                            id={`item-mult-${index}`}
                            type="number"
                            min="0"
                            step="any"
                            value={mult}
                            onChange={(e) => handleItemChange(index, 'multiplier', e.target.value)}
                            placeholder={labels.quantity}
                            title={labels.quantity}
                            className="w-full h-9 px-2 text-xs sm:text-sm font-mono text-center bg-white border border-stone-300 rounded-lg text-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Total Pieces Badge */}
                      <div className="flex items-center justify-between px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono text-emerald-800">
                        <span className="text-[10px] font-sans font-medium text-emerald-700">
                          {item.quantity} {labels.pieces} &times; {mult} {labels.quantity} =
                        </span>
                        <span className="font-bold">
                          {totalPieces} {labels.totalPieces}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field 4: Final Price (Total Pieces × One Piece Price) */}
                  <div className="md:col-span-2 text-right">
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center bg-white md:bg-transparent px-3 py-1.5 md:p-0 rounded-lg border border-stone-200 md:border-none">
                      <span className="md:hidden text-[11px] font-semibold text-stone-500">
                        {labels.finalPrice} ({totalPieces} &times; {invoice.currencySymbol}{item.unitPrice}):
                      </span>
                      <span
                        className="font-mono text-xs sm:text-sm font-bold text-stone-900 block truncate"
                        title={`${totalPieces} ${labels.totalPieces} × ${item.unitPrice} = ${lineTotal}`}
                      >
                        {formatCurrency(lineTotal, invoice.currencySymbol)}
                      </span>
                      <span className="hidden md:block text-[10px] font-mono text-stone-400">
                        {totalPieces} &times; {invoice.currencySymbol}{item.unitPrice}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Duplicate, Delete, Move) */}
                  <div className="md:col-span-1 flex items-center justify-end md:justify-center gap-1 pt-1 md:pt-0 border-t border-stone-200 md:border-none">
                    <button
                      type="button"
                      onClick={() => duplicateItem(index)}
                      className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                      title="Duplicate this line item"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove this line item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Prominent "+ Add Value Row" Button */}
        <div className="pt-2">
          <button
            id="add-value-btn"
            type="button"
            onClick={addItem}
            className="w-full py-3 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-amber-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-amber-600 stroke-[3]" />
            <span>+ Add Value / Line Item (Unlimited)</span>
          </button>
        </div>

      </div>

      {/* TOTAL AT THE END SECTION (Subtotal, Discount Option, Tax, Grand Total) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Discount &amp; Total Summary</h3>
              <p className="text-[11px] text-stone-500">Apply discount (flat amount or %) and optional tax before final total</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
          {/* Discount Input (Flat Amount or Percentage) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="discount-input" className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <span>Discount at the End</span>
              </label>
              <div className="inline-flex rounded-lg bg-stone-200/80 p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...invoice,
                      discountType: 'amount',
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    discountType === 'amount'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Amount ({invoice.currencySymbol})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...invoice,
                      discountType: 'percent',
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    discountType === 'percent'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Percent (%)
                </button>
              </div>
            </div>

            {discountType === 'amount' ? (
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono font-semibold text-stone-400 pointer-events-none">
                  {invoice.currencySymbol}
                </span>
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  step="any"
                  value={invoice.discountAmountValue || 0}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      discountType: 'amount',
                      discountAmountValue: Math.max(0, parseFloat(e.target.value) || 0),
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-mono bg-white border border-stone-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
            ) : (
              <div className="relative">
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={invoice.discountRate}
                  onChange={(e) =>
                    onChange({
                      ...invoice,
                      discountType: 'percent',
                      discountRate: Math.max(0, parseFloat(e.target.value) || 0),
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="0"
                  className="w-full pl-3 pr-7 py-2 text-xs sm:text-sm font-mono bg-white border border-stone-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-mono font-semibold text-stone-400 pointer-events-none">
                  %
                </span>
              </div>
            )}
          </div>

          {/* Tax Rate Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tax-rate" className="block text-xs font-bold text-stone-700">
                Tax Rate (%) <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="tax-rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={invoice.taxRate}
                onChange={(e) =>
                  onChange({
                    ...invoice,
                    taxRate: Math.max(0, parseFloat(e.target.value) || 0),
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="w-full pl-3 pr-7 py-2 text-xs sm:text-sm font-mono bg-white border border-stone-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none"
              />
              <span className="absolute right-3 top-2 text-xs font-mono font-semibold text-stone-400 pointer-events-none">%</span>
            </div>
          </div>
        </div>

        {/* Calculation breakdown */}
        <div className="space-y-2.5 max-w-sm ml-auto text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal ({invoice.items.length} {invoice.items.length === 1 ? 'item' : 'items'}):</span>
            <span className="font-mono font-medium">{formatCurrency(subtotal, invoice.currencySymbol)}</span>
          </div>

          <div className="flex justify-between items-center text-emerald-700">
            <span>
              Discount{discountType === 'percent' && invoice.discountRate > 0 ? ` (${invoice.discountRate}%)` : ''}:
            </span>
            <span className="font-mono font-semibold">
              -{formatCurrency(discountAmount, invoice.currencySymbol)}
            </span>
          </div>

          {invoice.taxRate > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Tax ({invoice.taxRate}%):</span>
              <span className="font-mono font-medium">+{formatCurrency(taxAmount, invoice.currencySymbol)}</span>
            </div>
          )}

          <div className="pt-2.5 border-t-2 border-stone-900 flex justify-between items-baseline">
            <div>
              <span className="text-base font-extrabold text-stone-900">Total at the End:</span>
              <p className="text-[11px] text-stone-500 font-normal">Final price after discount</p>
            </div>
            <span className="text-xl sm:text-2xl font-black font-mono text-stone-950">
              {formatCurrency(grandTotal, invoice.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Instructions & Notes */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="payment-terms" className="block text-xs font-semibold text-stone-700 mb-1">
              Payment Terms &amp; Instructions
            </label>
            <textarea
              id="payment-terms"
              rows={3}
              value={invoice.paymentTerms || ''}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  paymentTerms: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              placeholder="e.g. Bank: Chase Bank, Account: 1234-5678, Routing: 987654"
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none resize-none"
            />
          </div>

          <div>
            <label htmlFor="invoice-notes" className="block text-xs font-semibold text-stone-700 mb-1">
              Notes &amp; Client Message
            </label>
            <textarea
              id="invoice-notes"
              rows={3}
              value={invoice.notes || ''}
              onChange={(e) =>
                onChange({
                  ...invoice,
                  notes: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              placeholder="e.g. Thank you for choosing Apex Solutions Ltd. We appreciate your partnership!"
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:border-amber-500 outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Save & Advance Action Bar */}
      <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Save &amp; Continue Workflow</h4>
          </div>
          <p className="text-xs text-stone-400 max-w-md">
            Save this invoice permanently. Previous saved invoices remain locked and untouched. The next numbered invoice will open automatically with your data preserved for editing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {isEditingSaved && onSaveExisting && (
            <button
              type="button"
              onClick={onSaveExisting}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Update currently opened saved invoice directly"
            >
              <Save className="w-4 h-4 text-stone-400" />
              <span>Update Saved</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveAndNext}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              hasSavedJustNow
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
            title="Save as new and prepare next numbered invoice"
          >
            {hasSavedJustNow ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved as New!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save as New &amp; Next Invoice</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
