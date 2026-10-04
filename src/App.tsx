import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { SavedInvoicesModal } from './components/SavedInvoicesModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InvoiceData } from './types';
import { getInitialInvoice, SUPPORTED_CURRENCIES, createEmptyItem } from './data/constants';
import { exportInvoiceToCSV } from './utils/calculations';
import { getNextInvoiceNumber } from './utils/numbering';

const DRAFT_STORAGE_KEY = 'invoice_maker_current_draft';
const SAVED_STORAGE_KEY = 'invoice_maker_saved_list';

export default function App() {
  // Load initial invoice from local draft if available, else standard template
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage', e);
    }
    return getInitialInvoice();
  });

  // Saved invoices history
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>(() => {
    try {
      const savedList = localStorage.getItem(SAVED_STORAGE_KEY);
      if (savedList) {
        return JSON.parse(savedList);
      }
    } catch (e) {
      console.error('Failed to load saved invoices', e);
    }
    return [];
  });

  // Tracks if the user explicitly loaded a saved invoice to edit it
  const [isEditingSaved, setIsEditingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [hasSavedJustNow, setHasSavedJustNow] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save draft changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(invoice));
    } catch (e) {
      console.error('Failed to auto-save draft', e);
    }
  }, [invoice]);

  // Persist saved invoices list
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedInvoices));
    } catch (e) {
      console.error('Failed to persist saved invoices', e);
    }
  }, [savedInvoices]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Switch Currency
  const handleCurrencyChange = (currencyCode: string) => {
    const config = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];
    setInvoice((prev) => ({
      ...prev,
      currency: config.code,
      currencySymbol: config.symbol,
      updatedAt: new Date().toISOString(),
    }));
    showToast(`Currency changed to ${config.code} (${config.symbol})`);
  };

  /**
   * Save as New & Advance to Next Number (Core user request):
   * 1. Preserves the current invoice into savedInvoices under a unique immutable snapshot.
   * 2. Auto-increments invoiceNumber (e.g. INV-001 -> INV-002, 101 -> 102).
   * 3. Retains all previous company/customer/items/values data in the editor so the user can easily continue.
   * 4. Previous saved invoice is locked and cannot be changed unless explicitly opened via Edit in Saved modal.
   */
  const handleSaveAndNext = () => {
    const savedSnapshot: InvoiceData = {
      ...invoice,
      id: 'inv_saved_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      updatedAt: new Date().toISOString(),
    };

    // Calculate next auto-incremented invoice number
    const nextNum = getNextInvoiceNumber(invoice.invoiceNumber || 'INV-001');

    // Add to saved list without overwriting any existing saved invoice
    setSavedInvoices((prev) => [savedSnapshot, ...prev]);

    // Keep all current data intact for editing, assign a fresh draft id & next invoice number
    const nextDraft: InvoiceData = {
      ...invoice,
      id: 'inv_draft_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      invoiceNumber: nextNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoice(nextDraft);
    setIsEditingSaved(false);
    setHasSavedJustNow(true);
    showToast(`Invoice #${savedSnapshot.invoiceNumber} saved! Now on #${nextNum}`);
    setTimeout(() => setHasSavedJustNow(false), 2200);
  };

  /**
   * Update existing saved invoice:
   * Only used when the user explicitly opened an invoice from Saved Invoices to edit it.
   */
  const handleSaveExisting = () => {
    const existingIndex = savedInvoices.findIndex((inv) => inv.id === invoice.id);
    if (existingIndex >= 0) {
      const updatedList = [...savedInvoices];
      updatedList[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
      setSavedInvoices(updatedList);
      setHasSavedJustNow(true);
      showToast(`Updated saved invoice #${invoice.invoiceNumber}!`);
      setTimeout(() => setHasSavedJustNow(false), 2200);
    } else {
      // If not found in saved list, treat as Save & Next
      handleSaveAndNext();
    }
  };

  // Load a saved invoice explicitly for viewing / editing
  const handleLoadInvoice = (selectedInvoice: InvoiceData) => {
    setInvoice(selectedInvoice);
    setIsEditingSaved(true);
    showToast(`Opened saved invoice #${selectedInvoice.invoiceNumber} for editing`);
  };

  // Delete a saved invoice
  const handleDeleteSavedInvoice = (id: string) => {
    const updated = savedInvoices.filter((inv) => inv.id !== id);
    setSavedInvoices(updated);
    if (invoice.id === id) {
      setIsEditingSaved(false);
    }
    showToast('Saved invoice deleted');
  };

  // Create brand new fresh invoice
  const handleNewInvoice = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 14);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Determine starting number from highest saved or default INV-001
    const latestSaved = savedInvoices[0];
    const initialNum = latestSaved ? getNextInvoiceNumber(latestSaved.invoiceNumber) : 'INV-001';

    const newInv: InvoiceData = {
      id: 'inv_' + Math.random().toString(36).substring(2, 9),
      invoiceNumber: initialNum,
      issueDate: formatDate(today),
      dueDate: formatDate(nextMonth),
      company: {
        name: invoice.company.name || '',
        email: invoice.company.email || '',
        phone: invoice.company.phone || '',
        address: invoice.company.address || '',
        taxId: invoice.company.taxId || '',
      },
      customer: {
        name: '',
        email: '',
        phone: '',
        address: '',
      },
      items: [createEmptyItem()],
      columnLabels: invoice.columnLabels,
      currency: invoice.currency,
      currencySymbol: invoice.currencySymbol,
      taxRate: 0,
      discountRate: 0,
      discountType: invoice.discountType || 'amount',
      discountAmountValue: 0,
      notes: invoice.notes || 'Thank you for your business!',
      paymentTerms: invoice.paymentTerms || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoice(newInv);
    setIsEditingSaved(false);
    showToast('Started new blank invoice');
  };

  // Load standard sample data
  const handleLoadSample = () => {
    setInvoice(getInitialInvoice());
    setIsEditingSaved(false);
    showToast('Loaded sample invoice data');
  };

  // Print Invoice handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Keyboard shortcut listener (Ctrl+S / Cmd+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditingSaved) {
          handleSaveExisting();
        } else {
          handleSaveAndNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoice, isEditingSaved, savedInvoices]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 selection:bg-amber-200">
      
      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={invoice.currency}
        onCurrencyChange={handleCurrencyChange}
        onPrint={handlePrint}
        onSave={isEditingSaved ? handleSaveExisting : handleSaveAndNext}
        onSaveAndNext={handleSaveAndNext}
        isEditingSaved={isEditingSaved}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onLoadSample={handleLoadSample}
        onReset={handleNewInvoice}
        onExportCSV={() => exportInvoiceToCSV(invoice)}
        savedCount={savedInvoices.length}
        hasSavedJustNow={hasSavedJustNow}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Responsive Layout based on activeTab:
            - 'split': 2-column view on desktop, editor on left, preview on right
            - 'edit': full-width editor only
            - 'preview': full-width preview only
        */}

        {activeTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor Column */}
            <div className="lg:col-span-7 no-print">
              <InvoiceForm
                invoice={invoice}
                onChange={setInvoice}
                onReset={handleNewInvoice}
                onLoadSample={handleLoadSample}
                onSaveAndNext={handleSaveAndNext}
                onSaveExisting={handleSaveExisting}
                isEditingSaved={isEditingSaved}
                hasSavedJustNow={hasSavedJustNow}
              />
            </div>

            {/* Live Preview Column (Sticky on large screens) */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <InvoicePreview
                invoice={invoice}
                onPrint={handlePrint}
              />
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="max-w-4xl mx-auto no-print">
            <InvoiceForm
              invoice={invoice}
              onChange={setInvoice}
              onReset={handleNewInvoice}
              onLoadSample={handleLoadSample}
              onSaveAndNext={handleSaveAndNext}
              onSaveExisting={handleSaveExisting}
              isEditingSaved={isEditingSaved}
              hasSavedJustNow={hasSavedJustNow}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-4xl mx-auto">
            <InvoicePreview
              invoice={invoice}
              onPrint={handlePrint}
            />
          </div>
        )}

      </main>

      {/* Saved Invoices Modal */}
      <SavedInvoicesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedInvoices={savedInvoices}
        onLoadInvoice={handleLoadInvoice}
        onDeleteInvoice={handleDeleteSavedInvoice}
        onNewInvoice={handleNewInvoice}
        activeInvoiceId={invoice.id}
        isEditingSaved={isEditingSaved}
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

    </div>
  );
}
