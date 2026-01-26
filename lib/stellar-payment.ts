import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import type { NetworkType } from '@/app/store/authStore';

// Asset issuers on Stellar (these are well-known anchors)
const ASSET_ISSUERS = {
  USDC: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // Circle on Stellar
  EURT: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S', // Tempo on Stellar
  NGNT: 'GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3XQAQEU6XFKFJF7CSCN', // Cowrie on Stellar
  BRLT: 'GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP', // BRLTZ
  ARST: 'GCYE7C77EB5AWAA25R5XMWNI2EDOKTTFTTPZKM2SR5DI4B4WFD52DARS', // Anclap
};

// Get the Horizon server based on network
function getHorizonServer(network: NetworkType): StellarSdk.Horizon.Server {
  const url = network === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';
  return new StellarSdk.Horizon.Server(url);
}

// Get the network passphrase
function getNetworkPassphrase(network: NetworkType): string {
  return network === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;
}

// Create a Stellar asset object
function createAsset(assetCode: string, network: NetworkType): StellarSdk.Asset {
  if (assetCode === 'XLM') {
    return StellarSdk.Asset.native();
  }

  const issuer = ASSET_ISSUERS[assetCode as keyof typeof ASSET_ISSUERS];
  if (!issuer) {
    throw new Error(`Unknown asset: ${assetCode}`);
  }

  return new StellarSdk.Asset(assetCode, issuer);
}

// Validate Stellar address
export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Validate amount
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

interface PaymentParams {
  sourcePublicKey: string;
  destinationAddress: string;
  sendAssetCode: string;
  receiveAssetCode: string;
  sendAmount: string;
  memo?: string;
  network: NetworkType;
}

interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  amount: number;
  assetCode: string;
  error?: string;
}

/**
 * Main payment handler that builds, signs, and submits a Stellar transaction.
 * Uses path payment if assets differ, otherwise uses regular payment.
 */
export async function handlePayment(params: PaymentParams): Promise<PaymentResult> {
  const {
    sourcePublicKey,
    destinationAddress,
    sendAssetCode,
    receiveAssetCode,
    sendAmount,
    memo,
    network,
  } = params;

  try {
    // Validation
    if (!isValidStellarAddress(destinationAddress)) {
      return {
        success: false,
        amount: 0,
        assetCode: sendAssetCode,
        error: 'Invalid recipient Stellar address',
      };
    }

    if (!isValidAmount(sendAmount)) {
      return {
        success: false,
        amount: 0,
        assetCode: sendAssetCode,
        error: 'Invalid amount. Must be a positive number.',
      };
    }

    // Check Freighter connection
    const connected = await isConnected();
    if (!connected) {
      const accessGranted = await requestAccess();
      if (!accessGranted) {
        return {
          success: false,
          amount: parseFloat(sendAmount),
          assetCode: sendAssetCode,
          error: 'Freighter wallet access denied',
        };
      }
    }

    // Get Horizon server
    const server = getHorizonServer(network);
    const networkPassphrase = getNetworkPassphrase(network);

    // Load source account
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // Create transaction builder
    const transactionBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase,
    });

    // Create assets
    const sendAsset = createAsset(sendAssetCode, network);
    const receiveAsset = createAsset(receiveAssetCode, network);

    // Add operation based on whether assets match
    if (sendAssetCode === receiveAssetCode) {
      // Simple payment - same asset
      transactionBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: sendAsset,
          amount: sendAmount,
        })
      );
    } else {
      // Path payment - different assets (automatic DEX conversion)
      // Using pathPaymentStrictSend to ensure exact send amount
      transactionBuilder.addOperation(
        StellarSdk.Operation.pathPaymentStrictSend({
          sendAsset: sendAsset,
          sendAmount: sendAmount,
          destination: destinationAddress,
          destAsset: receiveAsset,
          destMin: '0.0000001', // Minimum acceptable destination amount (will be calculated by DEX)
          path: [], // Stellar will find the best path automatically
        })
      );
    }

    // Add memo if provided
    if (memo && memo.trim()) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(memo.trim().substring(0, 28))); // Max 28 chars
    }

    // Set timeout and build
    transactionBuilder.setTimeout(180); // 3 minutes
    const transaction = transactionBuilder.build();

    // Convert to XDR for Freighter
    const xdr = transaction.toXDR();

    // Sign with Freighter
    let signedXdr: string;
    try {
      const signResult = await signTransaction(xdr, {
        networkPassphrase,
      });
      
      // Freighter returns an object with signedTxXdr property
      if (typeof signResult === 'string') {
        signedXdr = signResult;
      } else if (signResult && 'signedTxXdr' in signResult) {
        signedXdr = signResult.signedTxXdr;
      } else {
        throw new Error('Invalid response from Freighter');
      }
    } catch (signError: any) {
      console.error('Freighter signing error:', signError);
      return {
        success: false,
        amount: parseFloat(sendAmount),
        assetCode: sendAssetCode,
        error: `Transaction signing failed: ${signError.message || 'User rejected'}`,
      };
    }

    // Reconstruct transaction from signed XDR
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      networkPassphrase
    ) as StellarSdk.Transaction;

    // Submit to network
    let response: StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse;
    try {
      response = await server.submitTransaction(signedTransaction);
    } catch (submitError: any) {
      console.error('Transaction submission error:', submitError);
      
      // Parse Stellar error
      let errorMessage = 'Transaction submission failed';
      if (submitError.response?.data?.extras?.result_codes) {
        const codes = submitError.response.data.extras.result_codes;
        errorMessage = `Transaction failed: ${codes.transaction || ''} ${
          codes.operations?.join(', ') || ''
        }`;
      } else if (submitError.message) {
        errorMessage = submitError.message;
      }

      return {
        success: false,
        amount: parseFloat(sendAmount),
        assetCode: sendAssetCode,
        error: errorMessage,
      };
    }

    // Success!
    console.log('✅ Transaction submitted successfully:', response.hash);

    return {
      success: true,
      transactionHash: response.hash,
      amount: parseFloat(sendAmount),
      assetCode: sendAssetCode,
    };

  } catch (error: any) {
    console.error('Payment handler error:', error);
    return {
      success: false,
      amount: parseFloat(sendAmount) || 0,
      assetCode: sendAssetCode,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Check if a destination account exists and has trustlines for the asset
 */
export async function checkDestinationAccount(
  destinationAddress: string,
  assetCode: string,
  network: NetworkType
): Promise<{ exists: boolean; hasTrustline: boolean; error?: string }> {
  try {
    const server = getHorizonServer(network);
    const account = await server.loadAccount(destinationAddress);

    // XLM doesn't require trustline
    if (assetCode === 'XLM') {
      return { exists: true, hasTrustline: true };
    }

    // Check if account has trustline for the asset
    const issuer = ASSET_ISSUERS[assetCode as keyof typeof ASSET_ISSUERS];
    const hasTrustline = account.balances.some(
      (balance: any) =>
        balance.asset_code === assetCode &&
        balance.asset_issuer === issuer
    );

    return { exists: true, hasTrustline };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { exists: false, hasTrustline: false, error: 'Account does not exist' };
    }
    return { exists: false, hasTrustline: false, error: error.message };
  }
}

/**
 * Get estimated received amount for path payment (for display purposes)
 */
export async function getPathPaymentEstimate(
  sendAssetCode: string,
  receiveAssetCode: string,
  sendAmount: string,
  network: NetworkType
): Promise<{ estimatedAmount: string; error?: string }> {
  try {
    if (sendAssetCode === receiveAssetCode) {
      return { estimatedAmount: sendAmount };
    }

    const server = getHorizonServer(network);
    const sendAsset = createAsset(sendAssetCode, network);
    const receiveAsset = createAsset(receiveAssetCode, network);

    // Use strict send path finding
    const paths = await server
      .strictSendPaths(sendAsset, sendAmount, [receiveAsset])
      .call();

    if (paths.records.length === 0) {
      return {
        estimatedAmount: '0',
        error: 'No payment path found. Check liquidity on Stellar DEX.',
      };
    }

    // Get the best path (first result)
    const bestPath = paths.records[0];
    return { estimatedAmount: bestPath.destination_amount };
  } catch (error: any) {
    console.error('Path payment estimate error:', error);
    return {
      estimatedAmount: '0',
      error: 'Unable to estimate conversion. Check network connection.',
    };
  }
}
