# QueueLess — Customer User Flow Guide

## Step-by-Step Experience

1. **QR Code Scanning**:
   - Customer scans the shop QR standee at the entrance, counter, or table using any smartphone camera or UPI app.
   - URL opens mobile web app directly at `/s/:shopSlug` (e.g. `/s/sri-lakshmi-tea`).

2. **Menu Browsing**:
   - Customer sees shop status (`OPEN`/`CLOSED`), language switcher (`EN`/`TA`/`HI`), and search bar.
   - Menu items are grouped into scrollable category tabs (Tea, Coffee, Snacks, Juice, Food).
   - Each item displays name, description, price (₹), counter badge, and `ADD` button or `SOLD OUT` state.

3. **Cart & Checkout**:
   - Adding items updates floating bottom cart bar showing total items & price.
   - Tapping `View Cart` opens checkout modal where customer can adjust quantities or remove items.
   - Customer selects payment method: `Pay Online (UPI)` or `Pay Cash at Billing Counter`.
   - Customer can optionally enter name/phone.

4. **Order Confirmation & Token**:
   - Order is submitted to backend, generating human-readable token (e.g., `A101`).
   - Confirmation screen displays token number in large bold text along with QR code and item summary.
   - Customer can download or print digital receipt.
