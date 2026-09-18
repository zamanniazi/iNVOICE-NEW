import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Save, 
  FolderOpen, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Sparkles,
  Check
} from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../data/constants';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'edit' | 'preview' | 'split';
  setActiveTab: (tab: 'edit' | 'preview' | 'split') => void;
  currency: string;
  onCurrencyChange: (currencyCode: string) => void;
  onPrint: () => void;
  onSave: () => void;
  onSaveAndNext?: () => void;
  isEditingSaved?: boolean;
  onOpenSaved: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onExportCSV: () => void;
  savedCount: number;
  hasSavedJustNow: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  onCurrencyChange,
  onPrint,
  onSave,
  onSaveAndNext,
  isEditingSaved,
  onOpenSaved,
  onLoadSample,
  onReset,
  onExportCSV,
  savedCount,
  hasSavedJustNow,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Branding & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Invoice Maker</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-800 text-amber-400 border border-stone-700">
                Auto-Calculating
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Company &bull; Customer &bull; Unlimited Auto-Multiplied Items
            </p>
          </div>
        </div>

        {/* Center: View Switcher (Desktop & Mobile) */}
        <div className="flex items-center bg-stone-800 p-1 rounded-lg border border-stone-700">
          <button
            id="tab-edit-btn"
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'edit'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </button>
          
          <button
            id="tab-split-btn"
            type="button"
            onClick={() => setActiveTab('split')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'split'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <span>Split View</span>
          </button>

          <button
            id="tab-preview-btn"
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Right: Currency & Actions */}
        <div className="flex items-center gap-2">
          {/* Currency Select */}
          <div className="relative">
            <select
              id="currency-selector"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-stone-800 text-stone-200 text-xs font-medium rounded-lg border border-stone-700 py-1.5 pl-2.5 pr-6 appearance-none hover:border-stone-600 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              title="Select Invoice Currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-2 text-stone-400 text-[10px]">▼</span>
          </div>

          {/* Quick Actions Dropdown / Group */}
          <div className="flex items-center gap-1.5">
            <button
              id="open-saved-btn"
              type="button"
              onClick={onOpenSaved}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Saved Invoices"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Saved</span>
              {savedCount > 0 && (
                <span className="bg-stone-700 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="save-invoice-btn"
              type="button"
              onClick={onSave}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hasSavedJustNow
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-xs'
              }`}
              title={isEditingSaved ? "Update saved invoice" : "Save as New & Next Invoice"}
            >
              {hasSavedJustNow ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-stone-950" />
                  <span className="hidden sm:inline">{isEditingSaved ? 'Update' : 'Save & Next'}</span>
                </>
              )}
            </button>

            <button
              id="export-csv-btn"
              type="button"
              onClick={onExportCSV}
              className="hidden lg:flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-medium transition-colors"
              title="Export as CSV spreadsheet"
            >
              <Download className="w-4 h-4 text-stone-400" />
              <span>CSV</span>
            </button>

            <PWAInstallButton />

            <button
              id="print-invoice-btn"
              type="button"
              onClick={onPrint}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-stone-300" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
