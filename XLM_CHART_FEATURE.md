# XLM Price Chart Feature

## Overview
Added a real-time XLM (Stellar Lumens) price chart to the dashboard overview page, displaying historical price data with interactive time range selection.

## Features

### 📊 Interactive Price Chart
- **Area chart visualization** with gradient fill
- **Multiple time ranges**: 7D, 1M, 3M, 1Y
- **Real-time price updates** from CoinGecko API
- **Price change indicators** with percentage and absolute value
- **Hover tooltips** showing exact price at any point
- **Refresh button** for manual data updates

### 💎 Design Elements
- Beautiful gradient styling matching Lume's design system
- Smooth animations using Framer Motion
- Responsive layout that adapts to all screen sizes
- Dark theme integration with glassmorphism effects
- Loading states and error handling

### 📈 Data Source
- **API**: CoinGecko public API (free, no key required)
- **Endpoint**: `/api/v3/coins/stellar/market_chart`
- **Update Frequency**: Real-time (fetched on load and refresh)
- **Historical Data**: Up to 1 year of daily price data

## Technical Implementation

### New Component
**File**: `app/components/dashboard/XLMPriceChart.tsx`

**Dependencies**:
- `recharts` - Charting library
- `framer-motion` - Animations
- `lucide-react` - Icons

**Key Features**:
- Fetches XLM/USD price data from CoinGecko
- Calculates price changes and percentages
- Renders responsive area chart with custom tooltips
- Handles loading and error states gracefully

### Integration
**Updated**: `app/components/dashboard/OverviewSection.tsx`
- Added XLMPriceChart component between Stats Grid and Recent Payments
- Positioned for optimal visibility in dashboard layout

### Package Installation
```bash
npm install recharts
```

## Usage

The chart appears automatically on the Overview page of the dashboard. Users can:

1. **View current XLM price** - Displayed prominently at the top
2. **See price trend** - Visual indicator shows if price is up (green) or down (red)
3. **Switch time ranges** - Click 7D, 1M, 3M, or 1Y buttons
4. **Hover for details** - Tooltip shows exact price at any date
5. **Refresh data** - Click refresh icon to fetch latest prices

## API Details

### CoinGecko API
- **Free tier**: No authentication required
- **Rate limit**: 10-50 calls/minute (sufficient for this use case)
- **Response format**: Array of `[timestamp, price]` pairs
- **Reliability**: High uptime, trusted data source

### Example API Call
```
GET https://api.coingecko.com/api/v3/coins/stellar/market_chart?vs_currency=usd&days=365&interval=daily
```

### Response Structure
```json
{
  "prices": [
    [1640995200000, 0.271234],
    [1641081600000, 0.275891],
    ...
  ]
}
```

## Styling

The chart follows Lume's design system:
- **Primary color**: Indigo (#6366f1)
- **Background**: Slate with glassmorphism
- **Typography**: System font stack
- **Borders**: Subtle slate borders
- **Hover effects**: Smooth transitions

## Future Enhancements

Potential improvements:
- [ ] Add volume data overlay
- [ ] Show market cap and trading volume
- [ ] Add price alerts functionality
- [ ] Support multiple cryptocurrencies
- [ ] Export chart as image
- [ ] Add technical indicators (RSI, MACD, etc.)
- [ ] Integrate with user's XLM holdings for portfolio value

## Testing

To test the chart:
1. Navigate to Dashboard → Overview
2. Verify chart loads with 1Y data by default
3. Click different time range buttons (7D, 1M, 3M, 1Y)
4. Hover over the chart to see tooltips
5. Click refresh button to reload data
6. Test responsive behavior on mobile/tablet

## Troubleshooting

### Chart not loading?
- Check browser console for API errors
- Verify internet connection
- Check CoinGecko API status

### Rate limit exceeded?
- Wait a minute before refreshing
- Consider implementing caching if needed

### Styling issues?
- Clear browser cache
- Verify Tailwind classes are compiled
- Check for CSS conflicts
