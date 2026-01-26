# Transaction History Feature

## Overview

The Transaction History feature provides a comprehensive view of all payment transactions made through Lume, combining real-time blockchain data from Stellar's Horizon API with employee information stored in Supabase.

## Features

### 1. **Real-time Transaction Fetching**
- Fetches the last 50 transactions from Stellar Horizon API
- Automatically updates when network changes (testnet ↔ mainnet)
- Shows transaction status, timestamps, and fees

### 2. **Employee Name Cross-Referencing**
- Cross-references blockchain transactions with Supabase `payouts` table
- Displays employee names and details when available
- Shows "Unknown" for transactions not linked to employees

### 3. **Interactive Statistics Dashboard**
- **Total Transactions**: Count of all transactions
- **Successful**: Number of completed transactions
- **Failed**: Number of failed transactions
- **Total Paid**: Sum of all payment amounts

### 4. **Advanced Filtering & Search**
- **Search**: Filter by transaction hash, employee name, or asset code
- **Status Filter**: View all, successful only, or failed transactions only
- **Real-time Updates**: Refresh button to fetch latest transactions

### 5. **CSV Export for Tax Compliance**
- Export filtered transactions to CSV format
- Includes all relevant fields: hash, date/time, employee, amount, asset, status, fees
- Filename includes current date: `lume_transactions_YYYY-MM-DD.csv`

### 6. **Status Icons (Lucide React)**
- ✅ **CheckCircle** (Green): Successful transactions
- ❌ **XCircle** (Red): Failed transactions
- ⏰ **Clock** (Gray): No transactions found

### 7. **Stellar Expert Integration**
- Direct links to view transactions on Stellar Expert blockchain explorer
- Opens in new tab for detailed transaction analysis
- Respects current network (testnet/mainnet)

## Component Structure

### Location
```
app/components/dashboard/HistoryTable.tsx
```

### Dependencies
```typescript
// Blockchain & API
@stellar/stellar-sdk      // Horizon API integration
@/app/store/authStore     // User authentication & network selection

// Database
@/app/actions/employees   // Server actions for payout data

// UI & Animation
framer-motion            // Smooth animations
lucide-react            // Status icons

// Data Export
json-2-csv              // CSV export functionality
```

## Data Flow

```
┌─────────────────────┐
│   HistoryTable      │
│    Component        │
└──────┬─────┬────────┘
       │     │
       │     └─────────────────────┐
       │                           │
       ▼                           ▼
┌─────────────────┐      ┌──────────────────┐
│ Stellar Horizon │      │ Supabase Server  │
│      API        │      │     Action       │
│                 │      │                  │
│ - Last 50 txs   │      │ getPayoutHistory │
│ - Account data  │      │ - Employee names │
│ - Status/fees   │      │ - Amounts        │
└─────────────────┘      └──────────────────┘
       │                           │
       │                           │
       └───────────┬───────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Enriched Data   │
         │  Merge by hash   │
         └──────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  Display Table   │
         │  with filters    │
         └──────────────────┘
```

## Server Action: `getPayoutHistory`

### Purpose
Fetch payout records with employee information from Supabase.

### Location
```
app/actions/employees.ts
```

### Signature
```typescript
export async function getPayoutHistory(
  ownerWallet: string, 
  limit: number = 50
): Promise<{
  data: PayoutRecord[];
  error: string | null;
}>
```

### Returns
```typescript
interface PayoutRecord {
  id: string;
  transactionHash: string | null;
  amount: number;
  assetCode: string;
  status: string;
  createdAt: string;
  employeeName: string;
  walletAddress: string;
}
```

### SQL Query
```sql
SELECT 
  p.id,
  p.transaction_hash,
  p.amount,
  p.asset_code,
  p.status,
  p.created_at,
  e.full_name as employee_name,
  e.wallet_address
FROM payouts p
INNER JOIN employees e ON p.employee_id = e.id
WHERE p.owner_wallet_address = ?
ORDER BY p.created_at DESC
LIMIT ?
```

## Usage Guide

### Navigating to History
1. Connect wallet via Freighter
2. Click **"Transaction History"** in the sidebar
3. View automatically loaded transaction data

### Searching Transactions
```
Search by:
- Transaction hash (full or partial)
- Employee name
- Asset code (XLM, USDC, etc.)
```

### Filtering
```
Status Filter Options:
- All Status (default)
- Success Only
- Failed Only
```

### Exporting Data
1. Apply desired filters/search
2. Click **"Export CSV"** button
3. CSV file downloads automatically
4. Use for accounting, tax reporting, or audits

### Viewing on Blockchain Explorer
- Click transaction hash link (e.g., `a1b2c3d4...`)
- Opens Stellar Expert in new tab
- Shows full transaction details, operations, and signatures

## Implementation Details

### State Management
```typescript
const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
```

### Horizon API Integration
```typescript
const server = new StellarSdk.Horizon.Server(horizonUrl);
const txResponse = await server
  .transactions()
  .forAccount(publicKey)
  .order('desc')
  .limit(50)
  .call();
```

### Data Enrichment
```typescript
// Create lookup map
const payoutMap = new Map<string, PayoutRecord>();
payouts?.forEach(payout => {
  if (payout.transactionHash) {
    payoutMap.set(payout.transactionHash, payout);
  }
});

// Enrich Stellar transactions
const enriched: EnrichedTransaction[] = stellarTxs.map(tx => {
  const payout = payoutMap.get(tx.hash);
  return {
    ...tx,
    employeeName: payout?.employeeName,
    amount: payout?.amount,
    assetCode: payout?.assetCode,
  };
});
```

### CSV Export Logic
```typescript
const csvData = filteredTransactions.map(tx => ({
  'Transaction Hash': tx.hash,
  'Date': new Date(tx.created_at).toLocaleString(),
  'Employee Name': tx.employeeName || 'N/A',
  'Amount': tx.amount || 'N/A',
  'Asset': tx.assetCode || 'N/A',
  'Status': tx.successful ? 'Success' : 'Failed',
  'Fee (Stroops)': tx.fee_charged,
  'Operations': tx.operation_count,
  'Memo': tx.memo || '',
}));

const csv = json2csv(csvData);
const blob = new Blob([csv], { type: 'text/csv' });
// Trigger download...
```

## Error Handling

### Network Errors
```typescript
try {
  const txResponse = await server.transactions()...
} catch (err: any) {
  setError(err.message || 'Failed to load transaction history');
}
```

### Missing Employee Data
- Transactions without employee links show "Unknown"
- Gracefully handles partial data
- No crashes on missing fields

### Empty States
```
No Transactions:
- "No transactions found"
- Helpful message: "Start making payments to see your transaction history"

No Search Results:
- "No transactions found"
- Helpful message: "Try adjusting your filters"
```

## Performance Considerations

### Optimization Strategies
1. **Limit to 50 transactions** - Prevents overwhelming API/UI
2. **Client-side filtering** - Fast search without additional API calls
3. **Memo-based caching** - Efficient re-renders with React
4. **Debounced search** - Could be added for very large datasets

### Future Improvements
- Pagination for viewing older transactions
- Date range filters
- Export all transactions (not just visible)
- Transaction detail modal with operation breakdown
- Real-time WebSocket updates for pending transactions

## Security

### Access Control
- Only owner's wallet address can view transactions
- Server action validates `owner_wallet_address` in queries
- Supabase RLS policies enforce row-level security

### Data Privacy
- Employee names only shown for authorized wallet addresses
- Transaction hashes are public (blockchain nature)
- No sensitive employee data exposed

## Testing Checklist

### Manual Testing
- [ ] Connect wallet and navigate to History
- [ ] Verify transactions load from Horizon API
- [ ] Check employee names appear for payouts
- [ ] Test search functionality (hash, name, asset)
- [ ] Test status filter (all/success/failed)
- [ ] Click Refresh button
- [ ] Export CSV and verify format
- [ ] Click Stellar Expert link and verify correct network
- [ ] Switch networks (testnet ↔ mainnet) and verify reload
- [ ] Disconnect wallet and reconnect

### Edge Cases
- [ ] No transactions (empty state)
- [ ] All transactions failed
- [ ] Transactions without employee links
- [ ] Very long employee names
- [ ] Special characters in search
- [ ] Network errors (offline mode)

## Troubleshooting

### Issue: Transactions not loading
**Solution**: Check Horizon API availability, verify network selection

### Issue: Employee names not showing
**Solution**: Ensure `recordPayoutAction` was called during payment, verify Supabase join query

### Issue: CSV export fails
**Solution**: Check browser permissions for downloads, verify json-2-csv installation

### Issue: Stellar Expert link incorrect
**Solution**: Verify `network` state matches actual connected network

## Dependencies Added

```bash
npm install --save json-2-csv
```

### Package Info
- **Name**: json-2-csv
- **Version**: Latest
- **Purpose**: Convert JSON to CSV format
- **License**: MIT
- **Size**: Minimal (~50KB)

## Related Files

### Server Actions
- `app/actions/employees.ts` - getPayoutHistory function

### Components
- `app/components/MainDashboard.tsx` - Navigation integration
- `app/components/dashboard/HistoryTable.tsx` - Main component

### Types
- `types/database.ts` - PayoutInsert, Employee types

### Utilities
- `lib/stellar-payment.ts` - Payment recording integration
- `lib/bulk-payment.ts` - Batch payment recording

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Add pagination for older transactions
- [ ] Transaction detail modal with operation breakdown
- [ ] Date range picker filter

### Phase 2 (Soon)
- [ ] Real-time transaction status updates
- [ ] Email notifications for failed transactions
- [ ] Advanced analytics (charts, trends)
- [ ] Scheduled/recurring payments history

### Phase 3 (Later)
- [ ] Multi-currency conversion display
- [ ] Tax report generation (1099-MISC, etc.)
- [ ] Audit trail with IP addresses
- [ ] Integration with accounting software (QuickBooks, Xero)

## Conclusion

The Transaction History feature completes the payment management lifecycle in Lume:
1. ✅ **Directory** - Manage employees
2. ✅ **Individual Payments** - Pay single employee
3. ✅ **Bulk Payments** - Pay multiple employees
4. ✅ **Transaction History** - View and export records

Users can now track, audit, and export all payment activity for tax compliance and financial reporting.
