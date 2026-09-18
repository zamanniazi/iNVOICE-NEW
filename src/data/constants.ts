import { CurrencyConfig, InvoiceData } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee (₨)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar ($)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar ($)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
];

export const createEmptyItem = () => ({
  id: 'item_' + Math.random().toString(36).substring(2, 9),
  name: '',
  unitPrice: 0,
  quantity: 1,
});

export const getInitialInvoice = (): InvoiceData => {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 14);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return {
    id: 'inv_' + Math.random().toString(36).substring(2, 9),
    invoiceNumber: `INV-${today.getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
    issueDate: formatDate(today),
    dueDate: formatDate(nextMonth),
    company: {
      name: 'Apex Solutions Ltd.',
      email: 'billing@apexsolutions.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Suite 100, Springfield, OR',
      taxId: 'TAX-8839201',
    },
    customer: {
      name: 'Acme Corporation',
      email: 'accounts@acme-corp.com',
      phone: '+1 (555) 987-6543',
      address: '450 Industrial Parkway, Building B, Metropolis, NY',
    },
    items: [
      {
        id: 'item_1',
        name: 'Custom Web Portal Development',
        unitPrice: 1200,
        quantity: 1,
      },
      {
        id: 'item_2',
        name: 'UI/UX Design Wireframes & Mockups',
        unitPrice: 450,
        quantity: 2,
      },
      {
        id: 'item_3',
        name: 'Cloud Hosting & SSL Setup',
        unitPrice: 150,
        quantity: 3,
      },
    ],
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0,
    discountRate: 0,
    notes: 'Thank you for your business! Please remit payment within 14 days of issue date.',
    paymentTerms: 'Payment via Bank Transfer / Wire to Apex Solutions Ltd.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
