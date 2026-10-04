import { InvoiceData, InvoiceItem } from '../types';
import { DEFAULT_COLUMN_LABELS } from '../data/constants';

export const calculateTotalPieces = (item: InvoiceItem): number => {
  const pieces = Number(item.quantity) || 0;
  const mult = item.multiplier !== undefined && item.multiplier !== null ? Number(item.multiplier) : 1;
  return Math.round(pieces * mult * 100) / 100;
};

export const calculateItemTotal = (item: InvoiceItem): number => {
  const price = Number(item.unitPrice) || 0;
  const totalPieces = calculateTotalPieces(item);
  return Math.round(price * totalPieces * 100) / 100;
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  const rate = Math.max(0, Number(taxRate) || 0);
  return Math.round(subtotal * (rate / 100) * 100) / 100;
};

export const calculateDiscountAmount = (
  subtotal: number,
  discountRate: number,
  discountType?: 'percent' | 'amount',
  discountAmountValue?: number
): number => {
  if (discountType === 'amount') {
    const flat = Math.max(0, Number(discountAmountValue) || 0);
    return Math.min(subtotal, Math.round(flat * 100) / 100);
  }
  const rate = Math.max(0, Number(discountRate) || 0);
  return Math.round(subtotal * (rate / 100) * 100) / 100;
};

export const getInvoiceDiscountAmount = (invoice: InvoiceData, subtotal?: number): number => {
  const sub = subtotal !== undefined ? subtotal : calculateSubtotal(invoice.items);
  return calculateDiscountAmount(sub, invoice.discountRate, invoice.discountType, invoice.discountAmountValue);
};

export const calculateGrandTotal = (
  subtotal: number,
  taxAmount: number,
  discountAmount: number
): number => {
  return Math.max(0, Math.round((subtotal + taxAmount - discountAmount) * 100) / 100);
};

export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const exportInvoiceToCSV = (invoice: InvoiceData) => {
  const labels = { ...DEFAULT_COLUMN_LABELS, ...(invoice.columnLabels || {}) };
  const subtotal = calculateSubtotal(invoice.items);
  const tax = calculateTaxAmount(subtotal, invoice.taxRate);
  const discount = getInvoiceDiscountAmount(invoice, subtotal);
  const total = calculateGrandTotal(subtotal, tax, discount);

  const rows: (string | number)[][] = [
    ['INVOICE', invoice.invoiceNumber],
    ['Company Name', invoice.company.name],
    ['Customer Name', invoice.customer.name],
    ['Date', invoice.issueDate],
    ['Due Date', invoice.dueDate],
    ['Currency', invoice.currency],
    [],
    [labels.description, labels.unitPrice, labels.pieces, labels.quantity, labels.totalPieces, labels.finalPrice],
  ];

  invoice.items.forEach((item) => {
    const mult = item.multiplier !== undefined && item.multiplier !== null ? item.multiplier : 1;
    rows.push([
      `"${item.name.replace(/"/g, '""')}"`,
      item.unitPrice,
      item.quantity,
      mult,
      calculateTotalPieces(item),
      calculateItemTotal(item),
    ]);
  });

  rows.push([]);
  rows.push(['Subtotal', '', '', '', '', subtotal]);
  if (discount > 0) {
    const discountLabel =
      invoice.discountType === 'amount'
        ? 'Discount'
        : `Discount (${invoice.discountRate}%)`;
    rows.push([discountLabel, '', '', '', '', `-${discount}`]);
  }
  if (invoice.taxRate > 0) {
    rows.push([`Tax (${invoice.taxRate}%)`, '', '', '', '', tax]);
  }
  rows.push(['GRAND TOTAL', '', '', '', '', total]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${invoice.invoiceNumber || 'invoice'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
