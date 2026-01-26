# Toast Notification Examples - Visual Guide

## Payment Success Flow

### BEFORE (Browser Alert)
```
┌────────────────────────────────────┐
│  Webpage Says                      │
│                                    │
│  Payment sent successfully!        │
│                                    │
│              [OK]                  │
└────────────────────────────────────┘
        ↑
    BLOCKS ENTIRE SCREEN
    User must click OK
    No transaction details
    Can't continue working
```

### AFTER (Sonner Toast)
```
                            ┌─────────────────────────────────┐
                            │ ✓ Payment Sent Successfully! 🎉│
                            │                                 │
                            │ Transaction confirmed on        │
                            │ Stellar network                 │
                            │                                 │
                            │ View on Stellar Expert →        │
                            │                           [×]   │
                            └─────────────────────────────────┘
                                    ↑
                            TOP-RIGHT CORNER
                            Non-blocking
                            Clickable link
                            Auto-dismisses in 8s
                            Can close manually
```

## Loading State Example

### Transaction Processing
```typescript
// Step 1: Show loading toast
┌─────────────────────────────────┐
│ ⏳ Sending payment...           │
│                                 │
│ Preparing transaction on        │
│ Stellar network                 │
│                           [×]   │
└─────────────────────────────────┘

// Step 2: Update to success (same toast, not new)
┌─────────────────────────────────┐
│ ✓ Payment Sent Successfully! 🎉│
│                                 │
│ Transaction confirmed           │
│                                 │
│ View on Stellar Expert →        │
│                           [×]   │
└─────────────────────────────────┘
```

## Error Examples

### 1. Freighter Not Installed
```
┌─────────────────────────────────┐
│ ✗ Freighter Wallet Not Found   │
│                                 │
│ Please install Freighter from   │
│ freighter.app and refresh       │
│ the page.                       │
│                           [×]   │
└─────────────────────────────────┘
```

### 2. Invalid Address
```
┌─────────────────────────────────┐
│ ✗ Invalid Address               │
│                                 │
│ Invalid recipient Stellar       │
│ address                         │
│                           [×]   │
└─────────────────────────────────┘
```

### 3. Transaction Failed
```
┌─────────────────────────────────┐
│ ✗ Payment Failed                │
│                                 │
│ Insufficient balance for        │
│ transaction                     │
│                           [×]   │
└─────────────────────────────────┘
```

## Success Examples

### 1. Wallet Connected
```
┌─────────────────────────────────┐
│ ✓ Wallet Connected              │
│                                 │
│ Connected to GDXK7N2T...        │
│ ...H4J9K2L3                     │
│                           [×]   │
└─────────────────────────────────┘
```

### 2. Employee Added
```
┌─────────────────────────────────┐
│ ✓ Employee Added                │
│                                 │
│ John Smith has been added to    │
│ the directory                   │
│                           [×]   │
└─────────────────────────────────┘
```

### 3. CSV Exported
```
┌─────────────────────────────────┐
│ ✓ CSV Exported                  │
│                                 │
│ 47 transactions exported        │
│ successfully                    │
│                           [×]   │
└─────────────────────────────────┘
```

## Rich Content Example (Payment Success)

### Full Implementation
```tsx
toast.success('Payment Sent Successfully! 🎉', {
  description: (
    <div className="flex flex-col gap-2">
      <span>Transaction confirmed on Stellar network</span>
      <a 
        href={explorerUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        View on Stellar Expert <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  ),
  id: toastId,
  duration: 8000,
});
```

### Visual Result
```
┌──────────────────────────────────────────┐
│ ✓ Payment Sent Successfully! 🎉         │
│                                          │
│ Transaction confirmed on Stellar network │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ View on Stellar Expert  →          │  │
│ │ (clickable link, indigo color)     │  │
│ └────────────────────────────────────┘  │
│                                    [×]   │
└──────────────────────────────────────────┘
```

## Mobile View

```
┌─────────────────────┐
│  📱 MOBILE SCREEN   │
│                     │
│  ┌───────────────┐ │
│  │ ✓ Payment Sent│ │
│  │               │ │
│  │ Transaction   │ │
│  │ confirmed     │ │
│  │               │ │
│  │ View tx → [×]│ │
│  └───────────────┘ │
│         ↑          │
│   TOP-RIGHT        │
│   Responsive       │
│                     │
└─────────────────────┘
```

## Comparison Table

| Aspect | Browser Alert | Sonner Toast |
|--------|--------------|--------------|
| **Visual** | ![Alert](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iMTAwIiB5PSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QWxlcnQgQm94PC90ZXh0Pjwvc3ZnPg==) | ![Toast](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMWUyOTNiIiBzdHJva2U9IiM0NzU1NjkiLz48dGV4dCB4PSIxMDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZTJlOGYwIj5Ub2FzdDwvdGV4dD48L3N2Zz4=) |
| **Position** | Center (blocks) | Top-right (non-blocking) |
| **Dismissal** | Manual click required | Auto-dismiss + close button |
| **Styling** | Browser default | Custom dark theme |
| **Content** | Plain text | Rich HTML, links, icons |
| **Loading States** | ❌ Not supported | ✅ Supported |
| **Multiple** | Queue awkwardly | Stack gracefully |
| **Accessibility** | Poor | Good (ARIA labels) |

## Color Coding

### Success (Green)
```
┌─────────────────────────────────┐
│ ✓ Success Message               │
│   (Green checkmark icon)        │
│   (Green border/background)     │
└─────────────────────────────────┘
```

### Error (Red)
```
┌─────────────────────────────────┐
│ ✗ Error Message                 │
│   (Red X icon)                  │
│   (Red border/background)       │
└─────────────────────────────────┘
```

### Loading (Blue)
```
┌─────────────────────────────────┐
│ ⏳ Loading Message...            │
│   (Spinning loader icon)        │
│   (Blue border/background)      │
└─────────────────────────────────┘
```

## Animation Example

```
Frame 1:  (Sliding in from right)
          ┌───────────┐
          │ Toast     │
          └───────────┘
               ↓

Frame 2:  (Fully visible)
     ┌────────────────┐
     │ Toast Message  │
     └────────────────┘
               ↓

Frame 3:  (After 8s, fading out)
     ┌────────────────┐
     │ Toast Message  │  (opacity: 0.5)
     └────────────────┘
               ↓

Frame 4:  (Sliding out)
          ┌───────────┐
          │ Toast     │
          └───────────┘
               ↓
          (Removed from DOM)
```

## Stacking Behavior

When multiple toasts appear:

```
                    ┌─────────────────────────────────┐
                    │ ✓ Payment Sent                  │  ← Newest (top)
                    └─────────────────────────────────┘
                            ↓ 10px gap
                    ┌─────────────────────────────────┐
                    │ ✓ Employee Added                │  ← Middle
                    └─────────────────────────────────┘
                            ↓ 10px gap
                    ┌─────────────────────────────────┐
                    │ ✓ Wallet Connected              │  ← Oldest (bottom)
                    └─────────────────────────────────┘
```

## Real-World Example: Complete Payment Flow

```
1. User clicks "Send Payment"
   ┌─────────────────────────────────┐
   │ ⏳ Sending payment...            │
   │                                 │
   │ Preparing transaction on        │
   │ Stellar network                 │
   └─────────────────────────────────┘

2. Freighter wallet opens
   [Freighter popup appears over page]

3. User signs transaction
   [Still showing loading toast in background]

4. Transaction submitted to Stellar
   [Loading toast still visible]

5. Transaction confirmed (5 seconds later)
   ┌─────────────────────────────────┐
   │ ✓ Payment Sent Successfully! 🎉│
   │                                 │
   │ Transaction confirmed on        │
   │ Stellar network                 │
   │                                 │
   │ View on Stellar Expert →        │
   │                           [×]   │
   └─────────────────────────────────┘
   (Same toast updated, not new one)

6. User clicks Stellar Expert link
   [New browser tab opens with transaction details]
   [Toast remains visible for 8 seconds total]

7. Toast auto-dismisses
   [Smooth fade-out animation]
```

## Theme Consistency

### Lume Dark Theme
```css
Background: rgb(30 41 59)    /* slate-800 */
Border:     rgb(71 85 105)   /* slate-600 */
Text:       rgb(226 232 240) /* slate-200 */
Success:    rgb(52 211 153)  /* emerald-400 */
Error:      rgb(248 113 113) /* red-400 */
Info:       rgb(129 140 248) /* indigo-400 */
```

### Visual Match
```
┌───────────────────────────────────────┐
│  LUME DASHBOARD (slate-900 bg)       │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Component (slate-800 bg)        │ │
│  └─────────────────────────────────┘ │
│                                       │
│        ┌─────────────────────────┐   │
│        │ ✓ Toast                 │   │  ← Same slate-800
│        │   (slate-800 bg)        │   │     Perfect match!
│        │   (slate-600 border)    │   │
│        └─────────────────────────┘   │
│                                       │
└───────────────────────────────────────┘
```

## Code Snippet: Minimal Example

```tsx
import { toast } from 'sonner';

// Success
toast.success('Payment sent!');

// Error
toast.error('Transaction failed');

// Loading → Success
const id = toast.loading('Processing...');
toast.success('Done!', { id });

// With description
toast.success('Payment sent', {
  description: 'Transaction confirmed',
});

// With link
toast.success('Success!', {
  description: <a href="...">View details</a>,
});
```

---

**Visual Guide Created**: January 26, 2026  
**Purpose**: Help developers and users understand the notification system  
**Status**: ✅ Complete
