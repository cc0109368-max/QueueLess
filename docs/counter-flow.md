# QueueLess — Counter Preparation KOT Flow

## Kitchen Display System (KDS / KOT)

Counter staff log in using counter-specific accounts (e.g. `tea@srilakshmi.com` for Tea Counter).

1. **Filtered Order Display**:
   - The screen shows ONLY order items routed to that specific counter.
   - Large token cards display Token Number (e.g., `#A101`), item name, quantity, and elapsed time.

2. **Preparation Workflow**:
   - `PENDING`: Item received. Staff clicks **Start Preparing**.
   - `PREPARING`: Item is being prepared. Staff clicks **Mark Ready**.
   - `READY`: Item is ready for customer pickup.

3. **Real-time Sync**:
   - When all items in an order are marked `READY` across their respective counters, the master order status updates automatically to `READY`.
