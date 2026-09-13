// Printer Service Abstraction
// Supports browser printing and thermal printer stubs

export interface IPrinterService {
  formatReceipt(data: ReceiptData): string;
}

export interface ReceiptData {
  shopName: string;
  shopDescription?: string;
  orderNumber: string;
  date: string;
  time: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

export class BrowserPrinterService implements IPrinterService {
  formatReceipt(data: ReceiptData): string {
    const lines: string[] = [];
    const w = 40; // receipt width in characters

    lines.push('='.repeat(w));
    lines.push(center(data.shopName, w));
    if (data.shopDescription) {
      lines.push(center(data.shopDescription, w));
    }
    lines.push('='.repeat(w));
    lines.push('');
    lines.push(`Order: #${data.orderNumber}`);
    lines.push(`Date:  ${data.date}`);
    lines.push(`Time:  ${data.time}`);
    lines.push('-'.repeat(w));

    for (const item of data.items) {
      const qty = `${item.quantity} × ${item.name}`;
      const price = `₹${item.totalPrice.toFixed(0)}`;
      lines.push(padBetween(qty, price, w));
    }

    lines.push('-'.repeat(w));
    lines.push(padBetween('Subtotal', `₹${data.subtotal.toFixed(0)}`, w));
    if (data.taxAmount > 0) {
      lines.push(padBetween('Tax', `₹${data.taxAmount.toFixed(2)}`, w));
    }
    lines.push(padBetween('TOTAL', `₹${data.total.toFixed(0)}`, w));
    lines.push('');
    lines.push(`Payment: ${data.paymentMethod}`);
    lines.push(`Status:  ${data.paymentStatus}`);
    lines.push('');
    lines.push('='.repeat(w));
    lines.push(center('Thank you!', w));
    lines.push(center('Powered by QueueLess', w));
    lines.push('='.repeat(w));

    return lines.join('\n');
  }
}

function center(text: string, width: number): string {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(pad) + text;
}

function padBetween(left: string, right: string, width: number): string {
  const space = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(space) + right;
}

// Named alias so routes can do `new PrinterService()`
export class PrinterService extends BrowserPrinterService {}

export function getPrinterService(): IPrinterService {
  return new BrowserPrinterService();
}
