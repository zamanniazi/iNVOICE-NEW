import { InvoiceData, InvoiceItem } from '../types';

export const calculateItemTotal = (item: InvoiceItem): number => {
  const price = Number(item.unitPrice) || 0;
  const qty = Number(item.quantity) || 0;
  return Math.round(price * qty * 100) / 100;
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
};

export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  const rate = Math.max(0, Number(taxRate) || 0);
  return Math.round(subtotal * (rate / 100) * 100) / 100;
};

export const calculateDiscountAmount = (subtotal: number, discountRate: number): number => {
  const rate = Math.max(0, Number(discountRate) || 0);
  return Math.round(subtotal * (rate / 100) * 100) / 100;
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
  const subtotal = calculateSubtotal(invoice.items);
  const tax = calculateTaxAmount(subtotal, invoice.taxRate);
  const discount = calculateDiscountAmount(subtotal, invoice.discountRate);
  const total = calculateGrandTotal(subtotal, tax, discount);

  const rows: (string | number)[][] = [
    ['INVOICE', invoice.invoiceNumber],
    ['Company Name', invoice.company.name],
    ['Customer Name', invoice.customer.name],
    ['Date', invoice.issueDate],
    ['Due Date', invoice.dueDate],
    ['Currency', invoice.currency],
    [],
    ['Item / Description', 'Unit Price', 'Quantity', 'Total'],
  ];

  invoice.items.forEach((item) => {
    rows.push([
      `"${item.name.replace(/"/g, '""')}"`,
      item.unitPrice,
      item.quantity,
      calculateItemTotal(item),
    ]);
  });

  rows.push([]);
  rows.push(['Subtotal', '', '', subtotal]);
  if (invoice.discountRate > 0) {
    rows.push([`Discount (${invoice.discountRate}%)`, '', '', `-${discount}`]);
  }
  if (invoice.taxRate > 0) {
    rows.push([`Tax (${invoice.taxRate}%)`, '', '', tax]);
  }
  rows.push(['GRAND TOTAL', '', '', total]);

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
