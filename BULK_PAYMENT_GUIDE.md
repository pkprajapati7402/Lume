# Bulk Payment System Documentation

## Overview
The Lume bulk payment system enables processing hundreds of payments in a single workflow with optimized transaction batching, real-time progress tracking, and intelligent error handling.

## Features

### ✅ Core Capabilities
- **Batch Processing**: Up to 100 payment operations per Stellar transaction
- **Progress Tracking**: Real-time updates showing "Processing X of Y transactions"
- **Partial Failure Handling**: Individual batch failures don't stop the entire process
- **Retry Mechanism**: Failed batches can be retried without re-processing successful ones
- **Cost Optimization**: Groups payments to minimize network fees
- **Database Integration**: Automatic recording of successful payments

## Architecture

### File Structure
```
lib/bulk-payment.ts          # Core bulk payment logic
app/components/dashboard/
  BulkUploadSection.tsx       # UI component with dual mode (employee/payment)
app/actions/employees.ts      # Server actions for database operations
```

### Payment Flow

```
CSV Upload → Parse & Validate → Group into Batches → Process Sequentially → Record to DB
                                       ↓
                              [Batch 1: 100 ops]
                              [Batch 2: 100 ops]
                              [Batch 3: remaining ops]
```

## Technical Implementation

### Batch Grouping

The system automatically groups recipients into batches:

```typescript
// Maximum 100 operations per transaction (Stellar limit)
const MAX_OPERATIONS_PER_TX = 100;

function groupRecipients(recipients: PaymentRecipient[]): PaymentRecipient[][] {
  const batches: PaymentRecipient[][] = [];
  for (let i = 0; i < recipients.length; i += MAX_OPERATIONS_PER_TX) {
    batches.push(recipients.slice(i, i + MAX_OPERATIONS_PER_TX));
  }
  return batches;
}
```

**Example**: 250 recipients → 3 batches (100 + 100 + 50)

### Transaction Building

Each batch creates a single transaction with multiple payment operations:

```typescript
const transactionBuilder = new TransactionBuilder(sourceAccount, {
  fee: BASE_FEE,
  networkPassphrase,
});

// Add payment operation for each recipient
for (const recipient of batch) {
  transactionBuilder.addOperation(
    Operation.payment({
      destination: recipient.address,
      asset: asset,
      amount: recipient.amount,
    })
  );
}
```

### Progress Tracking

Real-time progress updates via callback:

```typescript
interface BulkPaymentProgress {
  currentBatch: number;        // Currently processing batch
  totalBatches: number;        // Total number of batches
  processedRecipients: number; // Recipients completed so far
  totalRecipients: number;     // Total recipients
  completedBatches: BatchResult[];
  isProcessing: boolean;
  overallSuccess: boolean;
}
```

### Error Handling

**Batch-Level Failures**: If one batch fails, subsequent batches still process

```typescript
interface BatchResult {
  success: boolean;
  transactionHash?: string;
  recipients: PaymentRecipient[];
  error?: string;
  failedRecipients?: PaymentRecipient[]; // For retry
}
```

## Usage

### CSV Format

#### Bulk Payment Template
```csv
Full_Name,Wallet_Address,Amount,Role,Department,Preferred_Asset
John Doe,GXXXXX...XXXXX,1500,Software Engineer,Engineering,USDC
Jane Smith,GYYYYY...YYYYY,1200,Designer,Design,EURT
```

**Required Columns**:
- `Full_Name`: Employee name
- `Wallet_Address`: Stellar address (56 chars, starts with G)
- `Amount`: Payment amount (numeric)

**Optional Columns**:
- `Role`: Job title
- `Department`: Team/department
- `Preferred_Asset`: USDC, EURT, NGNT, BRLT, ARST, XLM

### UI Workflow

1. **Select Mode**: Choose "Bulk Payments" tab
2. **Download Template**: Get CSV template with Amount column
3. **Upload CSV**: Drag & drop or click to upload
4. **Review Summary**:
   - Number of recipients
   - Total amounts by asset
   - Estimated network fees
   - Number of transactions
5. **Execute**: Click "Send X Payments"
6. **Monitor Progress**: Watch real-time batch processing
7. **Handle Failures**: Retry failed batches if needed

### Code Example

```typescript
// Execute bulk payment
const progress = await executeBulkPayroll(
  publicKey,           // Sender's public key
  recipients,          // Array of PaymentRecipient objects
  network,             // 'testnet' or 'mainnet'
  (progress) => {      // Progress callback
    console.log(`Processing ${progress.currentBatch}/${progress.totalBatches}`);
    console.log(`Completed ${progress.processedRecipients}/${progress.totalRecipients}`);
  }
);

// Check results
if (progress.overallSuccess) {
  console.log('All payments successful!');
} else {
  // Retry failed batches
  const failedBatches = progress.completedBatches.filter(b => !b.success);
  await retryFailedRecipients(publicKey, failedBatches, network);
}
```

## Cost Optimization

### Fee Savings

**Without Batching** (individual transactions):
- 100 payments = 100 transactions
- Fee per tx: 0.00001 XLM
- **Total: 0.001 XLM**

**With Batching** (grouped transactions):
- 100 payments = 1 transaction
- Fee per tx: 0.00001 XLM
- **Total: 0.00001 XLM**

**Savings: 99% reduction in network fees!**

### Example Calculations

| Recipients | Individual TXs | Batched TXs | Fee Savings |
|-----------|----------------|-------------|-------------|
| 50        | 0.0005 XLM     | 0.00001 XLM | 98%         |
| 100       | 0.001 XLM      | 0.00001 XLM | 99%         |
| 250       | 0.0025 XLM     | 0.00003 XLM | 98.8%       |
| 1000      | 0.01 XLM       | 0.0001 XLM  | 99%         |

## Progress UI Components

### Progress Bar
```tsx
<div className="w-full bg-slate-700 rounded-full h-3">
  <motion.div
    animate={{ width: `${(processed / total) * 100}%` }}
    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
  />
</div>
```

### Batch Status Display
- ✅ **Success**: Green badge with transaction link
- ❌ **Failed**: Red badge with error message
- 🔄 **Processing**: Blue loading spinner

### Retry Button
Shows when any batch fails, allowing users to retry only failed payments without re-processing successful ones.

## Validation

Pre-flight checks before processing:

```typescript
validateRecipients(recipients) returns:
{
  valid: boolean;
  errors: string[]; // List of validation errors
}

// Validates:
// - Stellar address format
// - Amount is positive number
// - Asset code exists
// - Max 1000 recipients
```

## Database Integration

After successful payment, records are automatically created:

```typescript
await recordPayoutAction({
  transactionHash: batch.transactionHash,
  amount: parseFloat(recipient.amount),
  assetCode: recipient.assetCode,
  recipientWalletAddress: recipient.address,
  ownerWalletAddress: publicKey,
});
```

Creates entries in `payouts` table with:
- Transaction hash
- Amount and asset
- Employee lookup by wallet address
- Timestamp
- Success status

## Error Scenarios & Solutions

### Common Errors

**"Invalid Stellar address"**
- **Cause**: Address format incorrect
- **Solution**: Verify addresses start with 'G' and are 56 characters

**"Transaction failed: op_underfunded"**
- **Cause**: Insufficient balance for batch
- **Solution**: Add funds to sender account

**"Transaction failed: op_no_trust"**
- **Cause**: Recipient missing trustline
- **Solution**: Recipient must add trustline for asset

**"User rejected transaction"**
- **Cause**: User declined in Freighter wallet
- **Solution**: User can retry when ready

**Partial Batch Failure**
- **Cause**: One operation in batch failed
- **Solution**: Use retry button to reprocess failed recipients

## Performance

### Processing Speed
- Single batch (100 payments): ~5-8 seconds
- 10 batches (1000 payments): ~50-80 seconds
- Network dependent (Horizon API and Stellar consensus)

### Concurrency
Batches are processed **sequentially** to:
- Prevent nonce conflicts
- Ensure predictable ordering
- Allow mid-process cancellation
- Provide accurate progress tracking

## Best Practices

### For Users
1. **Test First**: Use testnet before mainnet
2. **Verify Addresses**: Double-check recipient addresses
3. **Check Trustlines**: Ensure recipients have trustlines for custom assets
4. **Monitor Progress**: Don't close browser during processing
5. **Review Results**: Check transaction links for each batch

### For Developers
1. **Validate Early**: Check all recipients before starting
2. **Handle Errors**: Always implement retry logic
3. **Log Everything**: Record all attempts for auditing
4. **Show Progress**: Keep users informed with real-time updates
5. **Test Edge Cases**: Try with 1, 99, 100, 101, and 1000 recipients

## Limitations

1. **Maximum Recipients**: 1000 per bulk payment (UI limitation)
2. **Operations Per TX**: 100 (Stellar protocol limit)
3. **Same Asset**: All payments in a batch must use same asset
4. **Sequential Processing**: Batches processed one at a time
5. **No Cross-Asset**: Can't mix USDC and EURT in same batch

## Future Enhancements

### Short Term
- [ ] Pause/Resume bulk payment process
- [ ] Download payment report as CSV
- [ ] Email notifications when complete
- [ ] Scheduled bulk payments

### Medium Term
- [ ] Multiple asset support in single batch
- [ ] Payment templates (recurring payroll)
- [ ] Approval workflow for large batches
- [ ] Historical bulk payment view

### Long Term
- [ ] Parallel batch processing (with sequence management)
- [ ] Smart retry with exponential backoff
- [ ] Payment splitting for large amounts
- [ ] Multi-signature support for batches

## Troubleshooting

### Slow Processing
- **Check**: Network congestion
- **Solution**: Wait or try during off-peak hours

### Failed Freighter Signing
- **Check**: Freighter wallet unlocked?
- **Solution**: Unlock wallet and retry

### Database Recording Failed
- **Check**: Network connection to Supabase
- **Solution**: Payment succeeded on-chain, database sync can be fixed later

### All Batches Failing
- **Check**: Sender account balance
- **Check**: Network selection (testnet vs mainnet)
- **Solution**: Verify configuration and retry

## Support Resources

- **Stellar Documentation**: https://developers.stellar.org
- **Stellar Discord**: https://discord.gg/stellar
- **GitHub Issues**: https://github.com/pkprajapati7402/Lume/issues
- **Stellar Expert**: https://stellar.expert (view transactions)

---

**Last Updated**: January 26, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Testnet)
