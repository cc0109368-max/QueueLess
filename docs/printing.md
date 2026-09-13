# QueueLess — Printer Integration Architecture

## Printer Abstraction

QueueLess supports dual printing strategies via `PrinterService`:

1. **Browser Native Print**:
   - Customer and Billing staff can print clean thermal-formatted receipts directly via standard browser print dialog (`window.print()`).
2. **ESC/POS Thermal Printer Protocol**:
   - Formats receipts into raw ESC/POS command buffers for USB / Network thermal printers (58mm & 80mm roll size).

## Receipt Layout Format
```
================================
     SRI LAKSHMI TEA & SNACKS
     Main Road, Salem, TN
================================
TOKEN NUMBER: A101
Date: 11/09/2026, 10:30 PM
Payment: CASH (PAID)
--------------------------------
1x Tea                     15.00
2x Samosa                  30.00
--------------------------------
Subtotal:                  45.00
Tax (5%):                   2.25
Total:                     47.25
================================
  Thank you for visiting!
  Powered by QueueLess
```
