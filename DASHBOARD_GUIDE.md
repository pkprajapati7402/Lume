# Dashboard Features Guide

## 🎨 Design System

The dashboard uses a professional **Slate and Indigo** color palette:
- Primary: Indigo (600-700)
- Background: Slate (900-950)
- Borders: Slate (700-800 with opacity)
- Text: White/Slate (300-400)
- Accents: Emerald for success, Red for errors

## 📊 Dashboard Sections

### 1. **Overview** (Default View)

#### Stats Cards
- **Total Paid**: Shows total payments in last 30 days with trend
- **Total Saved vs SWIFT**: Displays savings from using Stellar (90% lower fees)
- **Active Employees**: Number of team members across countries

#### Recent Payments Table
- **Columns**: Recipient, Amount, Asset, Time, Action
- **Features**:
  - Avatar initials for each recipient
  - Asset badges (USDC, EURT, NGNT, etc.)
  - "View on Ledger" button opens Stellar Expert
  - Hover effects on rows
  - "View all transactions" link at bottom

---

### 2. **Pay Employee**

#### Payment Form (Left Panel)
- **Recipient Address**: Stellar wallet address input
- **Send Amount**: Amount with asset selector dropdown
- **Recipient Receives**: Asset conversion selector
- **Memo**: Optional transaction memo
- **Send Payment**: Primary CTA button

#### Asset Swap Preview (Right Panel)
- **You Send**: Shows sending amount with asset icon
- **Exchange Rate**: Real-time FX rate display
- **Recipient Gets**: Calculated converted amount
- **Network Fee**: ~0.00001 XLM displayed
- **Payment Route**: Visual path showing USDC → Stellar DEX → Local Asset
- **Swap Button**: Quickly reverse assets

#### Supported Assets
- 💵 USDC (USD Coin)
- 🇪🇺 EURT (Euro Token)
- 🇳🇬 NGNT (Nigerian Naira)
- 🇧🇷 BRLT (Brazilian Real)
- 🇦🇷 ARST (Argentine Peso)

---

### 3. **Bulk Upload**

#### Upload Area (Left Panel)
- **Download Template**: Button to get CSV template
- **Drag & Drop**: File upload zone supporting .csv files
- **File Validation**: Shows success/error states
- **Process Payments**: Button appears after upload

#### CSV Format Guide (Right Panel)
- **Required Columns**:
  - `Recipient_Address`: Stellar G-address
  - `Amount`: Payment amount (numeric)
  - `Asset`: Asset code (USDC, EURT, etc.)
  - `Memo`: Transaction memo (optional)
- **Example CSV**: Code block with sample data
- **Important Notes**: Best practices and warnings

---

### 4. **Directory**

#### Features
- **Search Bar**: Filter by name, email, or country
- **Add Employee**: Primary CTA button
- **Employee Cards**: Grid layout with:
  - Avatar with initials
  - Name and country flag
  - Email address
  - Wallet address (truncated)
  - Preferred asset badge
  - Total paid amount
  - Edit/Delete buttons (appear on hover)
  - Quick Pay button

#### Card Information
Each employee card displays:
- Profile avatar with gradient background
- Country flag emoji
- Contact information
- Stellar wallet address
- Payment preferences
- Historical payment total

---

## 🎯 Navigation

### Sidebar Menu
- **Overview**: Dashboard home with stats
- **Pay Employee**: Single payment form
- **Bulk Upload**: CSV mass payments
- **Directory**: Employee management

### Top Header
- **Logo**: Lume branding with icon
- **Wallet Info**: Connected address (truncated)
- **Disconnect**: Logout button
- **Mobile Menu**: Hamburger for responsive design

---

## 🔄 Interactions

### Animations
- Fade-in on page load
- Section transitions when switching tabs
- Hover effects on all interactive elements
- Scale animations on cards and buttons

### Responsive Design
- Mobile: Hamburger menu, stacked layouts
- Tablet: 2-column grids
- Desktop: Full sidebar, multi-column grids

### States
- Loading states for async operations
- Empty states for no data
- Error states with helpful messages
- Success feedback after actions

---

## 🎨 Color Usage

```css
/* Primary Actions */
from-indigo-600 to-indigo-700

/* Backgrounds */
bg-slate-950 (darkest)
bg-slate-900 (dark)
bg-slate-800/50 (card backgrounds)

/* Borders */
border-slate-700/50 (subtle)
border-indigo-500/30 (highlighted)

/* Text */
text-white (primary)
text-slate-300 (secondary)
text-slate-400 (tertiary)

/* Success/Savings */
text-emerald-400
