export interface InvoiceItem {
  id: string;
  name: string;          // Value name / Item description
  unitPrice: number;     // One piece price
  quantity: number;      // Number of pieces (e.g. 20 students)
  multiplier?: number;   // Multiplied by quantity (e.g. 8 subjects -> 20 x 8 = 160 total pieces)
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

export interface ColumnLabels {
  description: string;
  unitPrice: string;
  pieces: string;
  quantity: string;
  totalPieces: string;
  finalPrice: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  company: CompanyDetails;
  customer: CustomerDetails;
  items: InvoiceItem[];
  columnLabels?: ColumnLabels;
  currency: string;
  currencySymbol: string;
  taxRate: number;               // percentage e.g. 0 or 10
  discountRate: number;          // percentage e.g. 0 or 5
  discountType?: 'percent' | 'amount'; // whether discount is % or flat amount
  discountAmountValue?: number;  // flat discount amount in currency
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}
