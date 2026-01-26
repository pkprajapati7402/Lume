import * as StellarSdk from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import type { NetworkType } from '@/app/store/authStore';

// Maximum operations per transaction (Stellar supports up to 100)
const MAX_OPERATIONS_PER_TX = 100;

// Asset issuers (same as stellar-payment.ts)
const ASSET_ISSUERS = {
  USDC: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  EURT: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
  NGNT: 'GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3XQAQEU6XFKFJF7CSCN',
  BRLT: 'GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP',
  ARST: 'GCYE7C77EB5AWAA25R5XMWNI2EDOKTTFTTPZKM2SR5DI4B4WFD52DARS',
};

function getHorizonServer(network: NetworkType): StellarSdk.Horizon.Server {
  const url = network === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';
  return new StellarSdk.Horizon.Server(url);
}

function getNetworkPassphrase(network: NetworkType): string {
  return network === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;
}

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

export interface PaymentRecipient {
  address: string;
  amount: string;
  assetCode: string;
  memo?: string;
  employeeName?: string;
}

export interface BatchResult {
  success: boolean;
  transactionHash?: string;
  recipients: PaymentRecipient[];
  error?: string;
  failedRecipients?: PaymentRecipient[];
}

export interface BulkPaymentProgress {
  currentBatch: number;
  totalBatches: number;
  processedRecipients: number;
  totalRecipients: number;
  completedBatches: BatchResult[];
  isProcessing: boolean;
  overallSuccess: boolean;
}

/**
 * Groups recipients into batches based on Stellar's operation limit
 */
export function groupRecipients(
  recipients: PaymentRecipient[],
  maxPerBatch: number = MAX_OPERATIONS_PER_TX
): PaymentRecipient[][] {
  const batches: PaymentRecipient[][] = [];
  
  for (let i = 0; i < recipients.length; i += maxPerBatch) {
    batches.push(recipients.slice(i, i + maxPerBatch));
  }
  
  return batches;
}

/**
 * Builds a single transaction with multiple payment operations
 */
async function buildBatchTransaction(
  sourcePublicKey: string,
  recipients: PaymentRecipient[],
  network: NetworkType
): Promise<StellarSdk.Transaction> {
  const server = getHorizonServer(network);
  const networkPassphrase = getNetworkPassphrase(network);
  
  // Load source account
  const sourceAccount = await server.loadAccount(sourcePublicKey);
  
  // Create transaction builder
  const transactionBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  });
  
  // Add payment operation for each recipient
  for (const recipient of recipients) {
    const asset = createAsset(recipient.assetCode, network);
    
    transactionBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: recipient.address,
        asset: asset,
        amount: recipient.amount,
      })
    );
  }
  
  // Add a single memo for the batch (optional)
  const batchMemo = `Batch payment: ${recipients.length} recipients`;
  transactionBuilder.addMemo(StellarSdk.Memo.text(batchMemo.substring(0, 28)));
  
  // Set timeout and build
  transactionBuilder.setTimeout(180);
  return transactionBuilder.build();
}

/**
 * Processes a single batch of payments
 */
async function processBatch(
  sourcePublicKey: string,
  recipients: PaymentRecipient[],
  network: NetworkType
): Promise<BatchResult> {
  try {
    // Build transaction
    const transaction = await buildBatchTransaction(sourcePublicKey, recipients, network);
    const xdr = transaction.toXDR();
    const networkPassphrase = getNetworkPassphrase(network);
    
    // Sign with Freighter
    let signedXdr: string;
    try {
      const signResult = await signTransaction(xdr, { networkPassphrase });
      
      if (typeof signResult === 'string') {
        signedXdr = signResult;
      } else if (signResult && 'signedTxXdr' in signResult) {
        signedXdr = signResult.signedTxXdr;
      } else {
        throw new Error('Invalid response from Freighter');
      }
    } catch (signError: any) {
      return {
        success: false,
        recipients,
        error: `Transaction signing failed: ${signError.message || 'User rejected'}`,
        failedRecipients: recipients,
      };
    }
    
    // Reconstruct and submit
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      networkPassphrase
    ) as StellarSdk.Transaction;
    
    const server = getHorizonServer(network);
    const response = await server.submitTransaction(signedTransaction);
    
    return {
      success: true,
      transactionHash: response.hash,
      recipients,
    };
    
  } catch (error: any) {
    console.error('Batch processing error:', error);
    
    let errorMessage = 'Transaction submission failed';
    if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      errorMessage = `Transaction failed: ${codes.transaction || ''} ${
        codes.operations?.join(', ') || ''
      }`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      recipients,
      error: errorMessage,
      failedRecipients: recipients,
    };
  }
}

/**
 * Main function to execute bulk payroll with progress tracking
 */
export async function executeBulkPayroll(
  sourcePublicKey: string,
  recipients: PaymentRecipient[],
  network: NetworkType,
  onProgress?: (progress: BulkPaymentProgress) => void
): Promise<BulkPaymentProgress> {
  // Group recipients into batches
  const batches = groupRecipients(recipients);
  
  const progress: BulkPaymentProgress = {
    currentBatch: 0,
    totalBatches: batches.length,
    processedRecipients: 0,
    totalRecipients: recipients.length,
    completedBatches: [],
    isProcessing: true,
    overallSuccess: true,
  };
  
  // Notify initial progress
  if (onProgress) onProgress({ ...progress });
  
  // Process each batch sequentially
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    progress.currentBatch = i + 1;
    if (onProgress) onProgress({ ...progress });
    
    // Process the batch
    const batchResult = await processBatch(sourcePublicKey, batch, network);
    
    progress.completedBatches.push(batchResult);
    progress.processedRecipients += batch.length;
    
    if (!batchResult.success) {
      progress.overallSuccess = false;
    }
    
    if (onProgress) onProgress({ ...progress });
  }
  
  progress.isProcessing = false;
  if (onProgress) onProgress({ ...progress });
  
  return progress;
}

/**
 * Retry failed recipients from a previous bulk payment
 */
export async function retryFailedRecipients(
  sourcePublicKey: string,
  failedBatches: BatchResult[],
  network: NetworkType,
  onProgress?: (progress: BulkPaymentProgress) => void
): Promise<BulkPaymentProgress> {
  // Extract all failed recipients
  const failedRecipients: PaymentRecipient[] = [];
  
  for (const batch of failedBatches) {
    if (batch.failedRecipients) {
      failedRecipients.push(...batch.failedRecipients);
    }
  }
  
  if (failedRecipients.length === 0) {
    return {
      currentBatch: 0,
      totalBatches: 0,
      processedRecipients: 0,
      totalRecipients: 0,
      completedBatches: [],
      isProcessing: false,
      overallSuccess: true,
    };
  }
  
  // Retry with the failed recipients
  return executeBulkPayroll(sourcePublicKey, failedRecipients, network, onProgress);
}

/**
 * Validates all recipients before processing
 */
export function validateRecipients(recipients: PaymentRecipient[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (recipients.length === 0) {
    errors.push('No recipients provided');
    return { valid: false, errors };
  }
  
  if (recipients.length > 1000) {
    errors.push('Maximum 1000 recipients allowed per bulk payment');
  }
  
  recipients.forEach((recipient, index) => {
    // Validate address
    try {
      StellarSdk.StrKey.decodeEd25519PublicKey(recipient.address);
    } catch {
      errors.push(`Recipient ${index + 1} (${recipient.employeeName || recipient.address}): Invalid Stellar address`);
    }
    
    // Validate amount
    const amount = parseFloat(recipient.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Recipient ${index + 1} (${recipient.employeeName || recipient.address}): Invalid amount`);
    }
    
    // Validate asset
    if (!recipient.assetCode) {
      errors.push(`Recipient ${index + 1} (${recipient.employeeName || recipient.address}): Asset code is required`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate total amount and fees for bulk payment
 */
export function calculateBulkPaymentCost(recipients: PaymentRecipient[]): {
  totalAmount: { [assetCode: string]: number };
  estimatedFees: number;
  numberOfTransactions: number;
} {
  const batches = groupRecipients(recipients);
  const totalAmount: { [assetCode: string]: number } = {};
  
  recipients.forEach(recipient => {
    const amount = parseFloat(recipient.amount);
    if (!totalAmount[recipient.assetCode]) {
      totalAmount[recipient.assetCode] = 0;
    }
    totalAmount[recipient.assetCode] += amount;
  });
  
  // Each transaction costs base fee per operation
  const estimatedFees = batches.length * 0.00001; // BASE_FEE in XLM per transaction
  
  return {
    totalAmount,
    estimatedFees,
    numberOfTransactions: batches.length,
  };
}
