/**
 * Utility for parsing and incrementing invoice numbers automatically.
 * Supports patterns like:
 * - INV-001 -> INV-002
 * - INV-2026-001 -> INV-2026-002
 * - 101 -> 102
 * - 1 -> 2
 * - BILL-5 -> BILL-6
 */
export function getNextInvoiceNumber(currentNumber: string): string {
  if (!currentNumber || !currentNumber.trim()) {
    return 'INV-002';
  }

  const trimmed = currentNumber.trim();

  // Match the last sequence of digits in the invoice number
  // e.g. "INV-001" -> prefix: "INV-", digits: "001"
  // e.g. "INV-2026-042" -> prefix: "INV-2026-", digits: "042"
  const match = trimmed.match(/^(.*?)(\d+)$/);

  if (match) {
    const prefix = match[1];
    const numStr = match[2];
    const nextVal = parseInt(numStr, 10) + 1;
    // Keep identical leading zeroes formatting if present
    const padded = String(nextVal).padStart(numStr.length, '0');
    return `${prefix}${padded}`;
  }

  // If there are digits somewhere in the middle, match the last number group
  const matchAnyNum = trimmed.match(/(.*?)(\d+)(\D*)$/);
  if (matchAnyNum) {
    const prefix = matchAnyNum[1];
    const numStr = matchAnyNum[2];
    const suffix = matchAnyNum[3];
    const nextVal = parseInt(numStr, 10) + 1;
    const padded = String(nextVal).padStart(numStr.length, '0');
    return `${prefix}${padded}${suffix}`;
  }

  // Fallback if no digits found at all (e.g. "INVOICE")
  return `${trimmed}-2`;
}
