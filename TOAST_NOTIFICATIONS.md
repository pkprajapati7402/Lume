# Toast Notification System - Implementation Guide

## Overview

Lume now uses **Sonner** for professional toast notifications instead of standard browser alerts. This provides a superior user experience with styled notifications, loading states, and actionable links.

## Package Information

- **Library**: Sonner
- **Installation**: `npm install sonner`
- **Documentation**: https://sonner.emilkowal.ski/
- **Features**: Loading states, success/error types, rich content, auto-dismiss, dark theme support

## Implementation

### 1. Global Provider (Layout)

**Location**: [app/layout.tsx](app/layout.tsx)

```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'rgb(30 41 59)',
              border: '1px solid rgb(71 85 105)',
              color: 'rgb(226 232 240)',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
```

**Configuration Options**:
- `position="top-right"` - Toasts appear in top-right corner
- `richColors` - Uses semantic colors (green for success, red for error, etc.)
- `closeButton` - Adds X button to manually dismiss toasts
- `toastOptions.style` - Custom dark theme matching Lume's design

### 2. Usage in Components

Import toast in any component:

```tsx
import { toast } from 'sonner';
```

## Toast Types & Examples

### ✅ Success Notifications

```tsx
toast.success('Payment Sent Successfully! 🎉', {
  description: 'Transaction confirmed on Stellar network',
  duration: 8000,
});
```

**Used For**:
- Payment confirmations
- Employee additions/deletions
- CSV exports
- Wallet connections

### ❌ Error Notifications

```tsx
toast.error('Freighter Wallet Not Found', {
  description: 'Please install Freighter from freighter.app',
  duration: 6000,
});
```

**Used For**:
- Wallet connection failures
- Transaction rejections
- Validation errors
- Account not found errors

### ⏳ Loading Notifications

```tsx
const toastId = toast.loading('Sending payment...', {
  description: 'Preparing transaction on Stellar network',
});

// Later update to success or error:
toast.success('Payment completed!', { id: toastId });
// OR
toast.error('Payment failed', { id: toastId });
```

**Used For**:
- Payment processing
- Transaction submission
- Long-running operations

### ℹ️ Info Notifications

```tsx
toast.info('Network Changed', {
  description: 'Switched to Stellar testnet',
});
```

### 🎨 Custom Content (Rich Notifications)

```tsx
const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${hash}`;

toast.success('Payment Sent Successfully! 🎉', {
  description: (
    <div className="flex flex-col gap-2">
      <span>Transaction confirmed on Stellar network</span>
      <a 
        href={explorerUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
      >
        View on Stellar Expert <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  ),
  duration: 8000,
});
```

## Implementation by Component

### PayEmployeeSection.tsx

**Before** (using state-based status messages):
```tsx
const [transactionStatus, setTransactionStatus] = useState({
  type: 'success' | 'error' | null,
  message: string,
  hash?: string
});

// In JSX:
{transactionStatus.type && (
  <div className={...}>
    {transactionStatus.message}
  </div>
)}
```

**After** (using toast):
```tsx
// No state needed!

// On error:
toast.error('Invalid Address', {
  description: 'Invalid recipient Stellar address',
});

// On success with link:
const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${hash}`;
toast.success('Payment Sent Successfully! 🎉', {
  description: (
    <div className="flex flex-col gap-2">
      <span>Transaction confirmed on Stellar network</span>
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
        View on Stellar Expert
      </a>
    </div>
  ),
  duration: 8000,
});
```

### Workflow for Stellar Transactions

```typescript
const handleSubmit = async () => {
  // 1. Show loading toast
  const toastId = toast.loading('Sending payment...', {
    description: 'Preparing transaction on Stellar network',
  });

  try {
    // 2. Process payment
    const result = await handlePayment({...});

    if (result.success && result.transactionHash) {
      // 3. Update to success with Stellar Expert link
      const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${result.transactionHash}`;
      
      toast.success('Payment Sent Successfully! 🎉', {
        description: (
          <div>
            <span>Transaction confirmed on Stellar network</span>
            <a href={explorerUrl} target="_blank">
              View on Stellar Expert
            </a>
          </div>
        ),
        id: toastId, // Update existing toast
        duration: 8000,
      });
    } else {
      // 4. Update to error
      toast.error('Payment Failed', {
        description: result.error || 'Transaction could not be completed',
        id: toastId,
      });
    }
  } catch (error) {
    toast.error('Unexpected Error', {
      description: error.message,
      id: toastId,
    });
  }
};
```

## Replaced Alert Instances

### Before & After Examples

#### 1. Wallet Connection
**Before**:
```tsx
alert('Freighter wallet is not installed. Please install it from freighter.app');
```

**After**:
```tsx
toast.error('Freighter Wallet Not Found', {
  description: 'Please install Freighter from freighter.app and refresh the page.',
  duration: 6000,
});
```

#### 2. Success Confirmation
**Before**:
```tsx
alert('Employee added successfully!');
```

**After**:
```tsx
toast.success('Employee Added', {
  description: `${employeeName} has been added to the directory`,
});
```

#### 3. CSV Export
**Before**:
```tsx
if (transactions.length === 0) {
  alert('No transactions to export');
  return;
}
// ... export logic
alert('CSV exported successfully!'); // No confirmation before
```

**After**:
```tsx
if (transactions.length === 0) {
  toast.error('No Transactions', {
    description: 'There are no transactions to export',
  });
  return;
}
// ... export logic
toast.success('CSV Exported', {
  description: `${transactions.length} transactions exported successfully`,
});
```

## All Notification Locations

### Wallet Connection (Navbar.tsx & LandingPage.tsx)
- ❌ Freighter not installed
- ❌ Access denied
- ❌ Failed to retrieve address
- ❌ Connection error
- ✅ Wallet connected

### Payment Processing (PayEmployeeSection.tsx)
- ⏳ Sending payment (loading)
- ✅ Payment sent successfully (with Stellar Expert link)
- ❌ Invalid address
- ❌ Invalid amount
- ❌ Recipient account not found
- ❌ Missing trustline
- ❌ Transaction failed

### Employee Management (DirectorySection.tsx)
- ✅ Employee added
- ✅ Employee deleted
- ❌ Failed to add employee
- ❌ Failed to delete employee
- ❌ Wallet not connected

### Transaction History (HistoryTable.tsx)
- ✅ CSV exported
- ❌ No transactions to export
- ❌ Export failed

## Styling & Theming

### Dark Theme Configuration

Toasts match Lume's dark theme:

```tsx
toastOptions={{
  style: {
    background: 'rgb(30 41 59)',      // slate-800
    border: '1px solid rgb(71 85 105)', // slate-600
    color: 'rgb(226 232 240)',         // slate-200
  },
}}
```

### Custom Classes

For even more control, you can add custom classes:

```tsx
toast.success('Payment Sent', {
  description: 'Transaction confirmed',
  className: 'my-custom-toast',
  descriptionClassName: 'text-sm',
});
```

## Duration Guidelines

| Type | Duration | Reason |
|------|----------|--------|
| Error (critical) | 6000ms (6s) | User needs time to read error details |
| Success (with link) | 8000ms (8s) | User may want to click Stellar Expert link |
| Success (simple) | 4000ms (4s) | Default, auto-dismisses quickly |
| Info | 4000ms (4s) | Default |
| Loading | Infinite | Must be manually updated to success/error |

## Best Practices

### 1. Always Update Loading Toasts
```tsx
// ✅ Good
const id = toast.loading('Processing...');
toast.success('Done!', { id });

// ❌ Bad - leaves loading toast spinning forever
toast.loading('Processing...');
// ... forgot to update
```

### 2. Provide Helpful Descriptions
```tsx
// ✅ Good
toast.error('Connection Failed', {
  description: 'Failed to retrieve wallet address. Please try again.',
});

// ❌ Bad - not actionable
toast.error('Error');
```

### 3. Use Rich Content for Links
```tsx
// ✅ Good - clickable link
toast.success('Success!', {
  description: <a href="...">View transaction</a>,
});

// ❌ Bad - just text
toast.success('Success! View at https://stellar.expert/...');
```

### 4. Appropriate Durations
```tsx
// ✅ Good - long duration for important info
toast.success('Payment completed', {
  description: <a href="...">View on Stellar Expert</a>,
  duration: 8000,
});

// ❌ Bad - too short for user to click
toast.success('Done!', {
  description: <a href="...">Important link</a>,
  duration: 1000,
});
```

## Testing Checklist

- [ ] Wallet connection success/error toasts
- [ ] Payment loading → success with Stellar Expert link
- [ ] Payment loading → error with descriptive message
- [ ] Employee add/delete success toasts
- [ ] CSV export success toast with count
- [ ] No transactions export error toast
- [ ] Freighter not installed error toast
- [ ] Access denied error toast
- [ ] Invalid address/amount error toasts
- [ ] Toasts auto-dismiss after appropriate duration
- [ ] Close button works on all toasts
- [ ] Toasts don't stack awkwardly (Sonner handles this)
- [ ] Dark theme matches application design

## Benefits Over Browser Alerts

| Feature | Browser Alert | Sonner Toast |
|---------|---------------|--------------|
| **Appearance** | Browser-specific, can't customize | Fully styled, matches app theme |
| **UX** | Blocks UI, requires user action | Non-blocking, auto-dismisses |
| **Content** | Text only | Rich HTML, links, icons, images |
| **Position** | Center (blocks everything) | Top-right corner (doesn't block) |
| **Multiple alerts** | Queue up awkwardly | Stack gracefully |
| **Loading states** | Not supported | Built-in loading → success/error flow |
| **Accessibility** | Poor (interrupts screen readers) | Good (ARIA labels, semantic colors) |
| **Mobile** | Native popup (inconsistent) | Responsive, touch-friendly |

## Advanced Features

### Promise-based Toasts

```tsx
const promise = sendPayment();

toast.promise(promise, {
  loading: 'Sending payment...',
  success: 'Payment sent!',
  error: 'Payment failed',
});
```

### Custom Actions

```tsx
toast('Transaction failed', {
  description: 'Would you like to retry?',
  action: {
    label: 'Retry',
    onClick: () => handlePayment(),
  },
});
```

### Dismissing Toasts Programmatically

```tsx
const toastId = toast('Processing...');

// Later:
toast.dismiss(toastId);
// Or dismiss all:
toast.dismiss();
```

## Future Enhancements

- [ ] Add action buttons (Retry, Undo, etc.)
- [ ] Group similar notifications
- [ ] Persistent toasts for critical errors
- [ ] Sound notifications (optional)
- [ ] Desktop notifications (using Notification API)
- [ ] Toast history/log for debugging

## Conclusion

The toast notification system provides a professional, user-friendly way to communicate status, errors, and successes throughout Lume. It enhances UX by:

1. ✅ **Non-blocking** - Users can continue interacting while toasts are visible
2. ✅ **Informative** - Rich descriptions and actionable links
3. ✅ **Consistent** - Same notification style across the entire app
4. ✅ **Accessible** - Proper ARIA labels and semantic colors
5. ✅ **Beautiful** - Matches Lume's dark theme perfectly

All browser `alert()` calls have been eliminated in favor of this modern notification system.

---

**Created**: January 26, 2026  
**Status**: ✅ Complete and Production-Ready
