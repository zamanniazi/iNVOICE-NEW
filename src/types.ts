export interface InvoiceItem {
  id: string;
  name: string;          // Value name / Item description
  unitPrice: number;     // One piece price
  quantity: number;      // Number of pieces
}

export interface CompanyDetails {
  name: string;          // Specific name of company
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface CustomerDetails {
  name: string;          // Customer name
  email?: string;
  phone?: string;
  address?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  company: CompanyDetails;
  customer: CustomerDetails;
  items: InvoiceItem[];
  currency: string;
  currencySymbol: string;
  taxRate: number;        // percentage e.g. 0 or 10
  discountRate: number;   // percentage e.g. 0 or 5
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}
