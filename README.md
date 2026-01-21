# Lume - Global Payroll at the Speed of Light ⚡

Lume is a modern global payroll platform built on the Stellar blockchain network. Pay your international team in seconds with 90% lower fees compared to traditional payment methods like SWIFT and wire transfers.

## 🌟 Features

### Core Functionality
- **Individual Payouts** - Instant FX conversion for single payments with real-time exchange rates
- **Bulk Payments** - CSV upload for mass distributions, process hundreds of transactions in one click
- **Direct Off-Ramps** - MoneyGram integration for cash pickups without requiring bank accounts
- **Live FX Rates** - Real-time orderbook monitoring with liquidity status indicators
- **Account Balance Tracking** - View all asset balances across Stellar testnet and mainnet
- **Savings Calculator** - Automated calculation showing cost savings vs traditional payment methods

### Dashboard Features
- **Network Toggle** - Switch between Stellar testnet and mainnet seamlessly
- **Transaction History** - View and track all payment transactions on-chain
- **Network Statistics** - Live monitoring of Stellar network speed and base fees
- **Employee Directory** - Manage and organize your global team members

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- [Freighter Wallet](https://www.freighter.app/) browser extension installed
- A funded Stellar account (testnet or mainnet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pkprajapati7402/Lume.git
cd Lume
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Connect Your Wallet

1. Install the [Freighter Wallet](https://www.freighter.app/) browser extension
2. Create or import your Stellar account
3. Click "Get Started" or "Connect Wallet" on the Lume homepage
4. Approve the connection request in Freighter

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Blockchain**: Stellar SDK
- **Wallet Integration**: Freighter API
- **State Management**: Zustand
- **Icons**: Lucide React

## 📋 Project Structure

```
Lume/
├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AccountBalance.tsx      # Account balance display
│   │   │   ├── LiquidityMonitor.tsx    # Live FX rate monitor
│   │   │   ├── SavingsCalculator.tsx   # Cost savings calculator
│   │   │   ├── OverviewSection.tsx     # Dashboard overview
│   │   │   ├── PayEmployeeSection.tsx  # Individual payment form
│   │   │   ├── BulkUploadSection.tsx   # Bulk payment upload
│   │   │   └── DirectorySection.tsx    # Employee directory
│   │   ├── AppLayout.tsx               # Main app layout
│   │   ├── Footer.tsx                  # Footer component
│   │   ├── LandingPage.tsx             # Homepage
│   │   ├── MainDashboard.tsx           # Dashboard container
│   │   └── Navbar.tsx                  # Navigation bar
│   ├── hooks/
│   │   └── useStellarNetworkStats.ts   # Network stats hook
│   ├── store/
│   │   └── authStore.ts                # Zustand state management
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Root page
├── public/                             # Static assets
└── package.json                        # Dependencies
```

## 💰 Pricing

- **Transaction Fee**: 1% flat rate per transaction
- **No Hidden Fees**: Transparent pricing with no surprises
- **Volume Discounts**: Available for enterprise customers
- **Instant Settlement**: 5-second transaction finality

## 🔧 Configuration

### Network Selection
Toggle between Stellar testnet and mainnet using the network selector in the dashboard header:
- **Testnet**: For testing and development
- **Mainnet**: For production payments

### Supported Assets
- XLM (Stellar Lumens)
- USDC (USD Coin)
- EURT (Euro Token)
- NGNT (Nigerian Naira Token)
- And all other Stellar-issued assets

## 📖 Usage

### Making Individual Payments
1. Navigate to "Pay Employee" section
2. Enter recipient's Stellar address
3. Select asset and amount
4. Confirm transaction in Freighter wallet

### Bulk Payments
1. Go to "Bulk Upload" section
2. Download CSV template
3. Fill in payment details
4. Upload CSV file
5. Review and confirm batch transaction

### Monitoring Liquidity
The Live FX Rate component shows:
- Current exchange rate between asset pairs
- Top bid/ask prices from the orderbook
- Spread percentage
- Liquidity status (Stable < 1% spread)

## 🔐 Security

- Non-custodial: You maintain full control of your funds
- Secure wallet integration via Freighter
- All transactions signed locally in your wallet
- Built on Stellar's proven blockchain infrastructure

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Stellar Network](https://stellar.org)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)

## 📞 Support

For questions or support:
- Email: support@lume.pay
- Documentation: Check the docs folder
- Issues: GitHub Issues

---

Built with ❤️ on the Stellar Network
