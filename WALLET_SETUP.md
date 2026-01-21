# Freighter Wallet Connection Guide

## Testing the Wallet Connection

### Prerequisites
1. **Install Freighter Wallet**: Visit [freighter.app](https://www.freighter.app/) and install the browser extension
2. **Create/Import a Wallet**: Set up your Stellar wallet in Freighter
3. **Make sure Freighter is unlocked** before clicking "Get Started"

### Updated Connection Flow

The wallet connection has been improved with:

1. **Better Error Handling**: Clear error messages at each step
2. **Proper API Usage**: Using `requestAccess()` instead of deprecated methods
3. **User Feedback**: Console logs show connection progress
4. **Auto-redirect**: Opens Freighter website if extension is not detected

### How to Test

1. **Open the app**: Navigate to http://localhost:3000
2. **Click "Get Started"**: On any of the CTA buttons
3. **Approve the request**: When Freighter popup appears, click "Approve"
4. **View Dashboard**: Should smoothly transition to the dashboard

### Troubleshooting

#### "Freighter wallet is not installed"
- Install the Freighter extension from freighter.app
- Refresh the page after installation

#### "Access to Freighter wallet was denied"
- Click "Get Started" again
- This time click "Approve" in the Freighter popup
- Don't close the popup without responding

#### "Failed to retrieve wallet address"
- Make sure Freighter is unlocked
- Check that you have at least one account in Freighter
- Try refreshing the page and connecting again

#### Connection works but dashboard doesn't show
- Check browser console for errors (F12)
- Verify localStorage has the auth data
- Clear browser cache and try again

### Console Output

When connection is successful, you should see:
```
Connected to wallet: G...
```

The wallet address will be stored in localStorage and persist across page refreshes.

### Manual Testing Commands

Open browser console (F12) and run:
```javascript
// Check if Freighter is installed
await window.freighter.isConnected()

// Request access
await window.freighter.requestAccess()

// Get address
await window.freighter.getAddress()
```
