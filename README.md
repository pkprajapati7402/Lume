<p align="center">
  <img src="public/lume-logo.png" alt="Lume Logo" width="300"/>
</p>

<h1 align="center">Lume - Global Payroll at the Speed of Light ⚡</h1>

<p align="center">
  <strong>The future of cross-border payments, powered by Stellar blockchain</strong>
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-the-solution">Solution</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stellar-Blockchain-blue?style=for-the-badge&logo=stellar" alt="Stellar"/>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

---

## 🌍 The Problem

### Cross-Border Payments Are Broken

In today's globalized economy, **$150+ trillion** flows across borders annually. Yet the systems powering these transactions are stuck in the 1970s:

| Traditional System | Pain Point |
|-------------------|------------|
| **SWIFT Transfers** | 3-5 business days, $25-50 per transaction |
| **Wire Transfers** | Hidden FX markups of 3-5% |
| **PayPal/Wise** | 1-2% fees + poor exchange rates |
| **Banks** | Weekend/holiday delays, compliance bottlenecks |

### Who Suffers?

- 🏢 **Businesses** paying international contractors lose thousands monthly to fees
- 👷 **Remote workers** in emerging markets wait days for paychecks
- 🌐 **Freelancers** lose 5-10% of earnings to payment processing
- 🏦 **Unbanked populations** (1.4 billion people) are excluded entirely

### The Numbers Don't Lie

```
Average SWIFT Transfer Cost:     $45 + 4% FX markup
Average Settlement Time:         3-5 business days
Failed Transaction Rate:         ~2-3%
Global Remittance Fees:          $48 billion/year (World Bank)
```

---

## 💡 The Solution

### Lume: Payroll Infrastructure for the Global Economy

Lume is a **next-generation payroll platform** built natively on the **Stellar blockchain network**. We leverage Stellar's unique capabilities to deliver:

| Lume Advantage | Value |
|----------------|-------|
| **⚡ 5-Second Settlement** | Payments finalize in seconds, not days |
| **💰 90% Lower Fees** | ~$0.0001 per transaction vs $45 SWIFT |
| **🌐 6 Currencies** | XLM, USDC, EURT, NGNT, BRLT, ARST |
| **🔒 Non-Custodial** | You control your funds, always |
| **📱 Multi-Wallet Support** | Freighter, xBull, Albedo, WalletConnect |

### Why Stellar?

Stellar was purpose-built for cross-border payments by Jed McCaleb (co-founder of Ripple). Unlike general-purpose blockchains:

- ✅ **Built-in DEX** - Automatic currency conversion at best rates
- ✅ **Anchored Assets** - Real fiat-backed stablecoins (USDC, EURT)
- ✅ **Regulatory Friendly** - Designed for compliance from day one
- ✅ **Energy Efficient** - Federated consensus, not proof-of-work
- ✅ **Battle Tested** - Processes millions of transactions daily

---

## 🚀 Features

### For Employers (14 Dashboard Components)

<table>
<tr>
<td width="50%">

#### 💳 Payment Processing
- **Individual Payouts** - Pay single employees with real-time FX
- **Bulk Payments** - CSV upload for mass distributions (100+ recipients)
- **Path Payments** - Automatic currency conversion via Stellar DEX
- **Memo Support** - Add payment references and notes

</td>
<td width="50%">

#### 👥 Team Management
- **Employee Directory** - Manage global team with search/filter
- **Department Analytics** - Spending breakdown by team
- **Quick Pay** - One-click payments from directory
- **Role-Based Access** - Employer vs Employee dashboards

</td>
</tr>
<tr>
<td>

#### 📊 Analytics & Reporting
- **Spending Trends** - 14-day/90-day charts
- **Asset Distribution** - Pie charts by currency
- **Top Recipients** - Payment volume rankings
- **Transaction History** - Full audit trail with CSV export

</td>
<td>

#### 📋 Compliance & Tax
- **W-2 Generation** - PDF tax forms for employees
- **1099-NEC Forms** - Contractor tax documents
- **Annual Reports** - Gross pay, withholding, net disbursed
- **Blockchain Verification** - Immutable audit trail

</td>
</tr>
</table>

### For Employees (5 Dashboard Components)

<table>
<tr>
<td width="50%">

#### 💰 Wallet Management
- **Multi-Asset Balances** - View all currencies
- **QR Code Receive** - Share address instantly
- **Privacy Mode** - Hide/show balances
- **Recent Transactions** - Last 10 payments

</td>
<td width="50%">

#### 📤 Send & Invest
- **P2P Payments** - Send to any Stellar address
- **Quick Amounts** - 10, 50, 100, 500 presets
- **Liquidity Pools** - Earn APR on idle assets
- **Spending Analytics** - Track sent vs received

</td>
</tr>
</table>

### 🔐 Escrow & Secure Trade (NEW)

A **2-of-3 multisig escrow system** for trustless B2B and P2P transactions:

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESCROW FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SELLER creates order    ──►  Escrow vault generated         │
│                                  (Stellar keypair)               │
│                                                                  │
│  2. BUYER searches order    ──►  Views amount & vault address   │
│                                                                  │
│  3. BUYER funds vault       ──►  Sends USDC to escrow           │
│                                                                  │
│  4. BUYER locks escrow      ──►  2-of-3 multisig applied        │
│                                  (Buyer + Seller + Admin)        │
│                                                                  │
│  5. GOODS delivered         ──►  Buyer confirms receipt         │
│                                                                  │
│  6. RELEASE                 ──►  Buyer signs + Admin co-signs   │
│                                  Funds released to Seller        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Security Guarantees:**
| Party | Can Release Alone? | Reason |
|-------|-------------------|--------|
| Buyer | ❌ No | Needs Admin co-sign |
| Seller | ❌ No | Needs Buyer OR Admin |
| Admin | ❌ No | Needs Buyer OR Seller |
| Buyer + Admin | ✅ Yes | 2-of-3 threshold met |

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              LUME PLATFORM                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │   NEXT.JS   │    │   ZUSTAND   │    │   SONNER    │                  │
│  │  FRONTEND   │◄──►│    STATE    │◄──►│   TOASTS    │                  │
│  │  (React 19) │    │  MANAGEMENT │    │             │                  │
│  └──────┬──────┘    └─────────────┘    └─────────────┘                  │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │                    WALLET LAYER                          │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │            │
│  │  │ FREIGHTER│ │  xBULL   │ │  ALBEDO  │ │WALLETCONNECT│ │            │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │            │
│  └─────────────────────────────────────────────────────────┘            │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │                 STELLAR BLOCKCHAIN                       │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │            │
│  │  │ HORIZON  │ │   DEX    │ │ MULTISIG │ │   ANCHORS   │ │            │
│  │  │   API    │ │ PATHFIND │ │  ESCROW  │ │ (USDC/EURT) │ │            │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │            │
│  └─────────────────────────────────────────────────────────┘            │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │                    DATA LAYER                            │            │
│  │  ┌───────────────────┐    ┌───────────────────────────┐ │            │
│  │  │     SUPABASE      │    │       COINGECKO API       │ │            │
│  │  │  (PostgreSQL DB)  │    │     (XLM Price Data)      │ │            │
│  │  │  - Employees      │    └───────────────────────────┘ │            │
│  │  │  - Payouts        │                                  │            │
│  │  │  - Escrow Orders  │                                  │            │
│  │  └───────────────────┘                                  │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Payment Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  SENDER  │────►│  LUME    │────►│ STELLAR  │────►│ RECEIVER │
│  WALLET  │     │  DAPP    │     │ NETWORK  │     │  WALLET  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │  1. Initiate   │                │                │
     │  Payment       │                │                │
     │───────────────►│                │                │
     │                │  2. Build TX   │                │
     │                │  (Path Payment)│                │
     │                │───────────────►│                │
     │  3. Sign TX    │                │                │
     │◄───────────────│                │                │
     │                │  4. Submit TX  │                │
     │                │───────────────►│                │
     │                │                │  5. Validate   │
     │                │                │  & Settle      │
     │                │                │───────────────►│
     │                │  6. Confirm    │                │
     │                │◄───────────────│                │
     │  7. Success    │                │                │
     │◄───────────────│                │                │
     │                │                │                │
     ▼                ▼                ▼                ▼
   ~0.5s            ~0.5s            ~4s             INSTANT
                                   (consensus)
```

### Database Schema

```sql
-- Core Tables
employees          -- Team member directory
payouts            -- Transaction records with enrichment
escrow_orders      -- 2-of-3 multisig escrow vault tracking

-- Escrow Order States
CREATED   →  Vault generated, awaiting payment
FUNDED    →  Buyer sent funds to vault
LOCKED    →  Multisig applied (2-of-3)
RELEASED  →  Funds sent to seller
REFUNDED  →  Funds returned to buyer
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16.1.4, React 19.2.3 | Server-side rendering, app router |
| **Styling** | Tailwind CSS 4, Framer Motion | Responsive design, animations |
| **State** | Zustand 5.0.10 | Lightweight state management |
| **Blockchain** | Stellar SDK 13.3.0 | Transaction building, signing |
| **Wallets** | Stellar Wallets Kit 1.9.5 | Multi-wallet integration |
| **Database** | Supabase (PostgreSQL) | Employees, payouts, escrow |
| **Charts** | Recharts 3.7.0 | Analytics visualizations |
| **PDF** | jsPDF 4.0.0 | Tax form generation |
| **Notifications** | Sonner 2.0.7 | Toast notifications |
| **Icons** | Lucide React 0.562.0 | Consistent iconography |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** installed
- **Freighter Wallet** browser extension ([Download](https://www.freighter.app/))
- **Stellar Account** funded on testnet or mainnet

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pkprajapati7402/Lume.git
cd Lume

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run database migrations
# Apply SQL files from /supabase/migrations in Supabase dashboard

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Escrow Admin (for 2-of-3 multisig)
ESCROW_ADMIN_SECRET_KEY=your_admin_secret
NEXT_PUBLIC_ESCROW_ADMIN_PUBLIC_KEY=your_admin_public
```

### Connect Your Wallet

1. Install [Freighter Wallet](https://www.freighter.app/) extension
2. Create or import a Stellar account
3. Fund with testnet XLM from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
4. Click "Get Started" on Lume homepage
5. Select your role (Employer or Employee)
6. Approve connection in Freighter

---

## 📁 Project Structure

```
Lume/
├── app/
│   ├── actions/                    # Server actions
│   │   ├── dashboard-stats.ts      # Dashboard statistics
│   │   ├── employees.ts            # Employee CRUD
│   │   ├── escrow.ts               # Escrow operations
│   │   └── recent-payments.ts      # Payment queries
│   ├── components/
│   │   ├── dashboard/              # Employer dashboard (14 components)
│   │   ├── employee-dashboard/     # Employee dashboard (5 components)
│   │   ├── escrow/                 # Escrow components
│   │   ├── MainDashboard.tsx       # Employer container
│   │   ├── EmployeeDashboard.tsx   # Employee container
│   │   ├── LandingPage.tsx         # Homepage
│   │   └── Navbar.tsx              # Navigation
│   ├── hooks/
│   │   └── useStellarNetworkStats.ts
│   ├── store/
│   │   ├── authStore.ts            # Auth & wallet state
│   │   └── escrowStore.ts          # Escrow state
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── stellar-payment.ts          # Stellar SDK helpers
│   ├── wallet-service.ts           # Wallet detection/connection
│   ├── bulk-payment.ts             # Batch processing
│   ├── employee-database.ts        # Employee queries
│   └── supabase.ts                 # Database client
├── supabase/
│   ├── migrations/                 # SQL migrations
│   └── schema.sql                  # Full schema
├── types/
│   ├── database.ts                 # DB type definitions
│   └── escrow.ts                   # Escrow type definitions
└── public/
    └── lume-logo.png
```

---

## 💰 Pricing

| Tier | Transaction Fee | Features |
|------|----------------|----------|
| **Starter** | 1% per transaction | Individual payments, basic analytics |
| **Business** | 0.75% per transaction | Bulk payments, compliance tools |
| **Enterprise** | Custom | Volume discounts, dedicated support |

**No hidden fees. No FX markups. What you see is what you pay.**

---

## 🔐 Security

### Non-Custodial Architecture
- ✅ **Your keys, your funds** - We never hold private keys
- ✅ **Local signing** - Transactions signed in your wallet
- ✅ **Open source** - Audit the code yourself

### Escrow Security
- ✅ **2-of-3 Multisig** - No single party can move funds
- ✅ **Server-side secrets** - Escrow keys never sent to clients
- ✅ **Row-level security** - Database access controls

### Stellar Security
- ✅ **5-second finality** - No chargebacks or reversals
- ✅ **Federated consensus** - Byzantine fault tolerant
- ✅ **Audited anchors** - USDC backed by Circle

---

## 🗺️ Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **Q1 2026** | Core payroll, multi-wallet | ✅ Complete |
| **Q2 2026** | Escrow, compliance tools | ✅ Complete |
| **Q3 2026** | Mobile app, MoneyGram integration | 🔄 In Progress |
| **Q4 2026** | Multi-chain support, fiat on-ramp | 📋 Planned |

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

| Resource | Link |
|----------|------|
| **Stellar Network** | [stellar.org](https://stellar.org) |
| **Freighter Wallet** | [freighter.app](https://www.freighter.app/) |
| **Stellar SDK Docs** | [stellar.github.io/js-stellar-sdk](https://stellar.github.io/js-stellar-sdk/) |
| **Stellar Laboratory** | [laboratory.stellar.org](https://laboratory.stellar.org/) |
| **Stellar Expert** | [stellar.expert](https://stellar.expert/) |

---

## 📞 Support

- 📧 **Email**: support@lume.pay
- 📖 **Documentation**: Check the `/docs` folder
- 🐛 **Issues**: [GitHub Issues](https://github.com/pkprajapati7402/Lume/issues)
- 💬 **Discord**: Coming soon

---

<p align="center">
  <strong>Built with ❤️ on the Stellar Network</strong>
</p>

<p align="center">
  <i>"Making global payments as easy as sending a text message"</i>
</p>
