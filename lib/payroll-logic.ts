import { createServerSupabaseClient } from './supabase'
import type { PayoutInsert } from '@/types/database'

interface TransactionResult {
  amount: number
  asset: string
  hash: string
}

interface RecordPayoutParams {
  transactionResult: TransactionResult
  recipientWalletAddress: string
  ownerWalletAddress: string
  batchId?: string | null
}

/**
 * Records a successful payout to the database after a Stellar transaction completes.
 * This function looks up the employee by wallet address and inserts a payout record.
 * Errors are logged but don't throw to avoid interrupting the UI flow.
 * 
 * @param params - The payout parameters
 * @returns Success status and optional employee ID
 */
export async function recordPayout({
  transactionResult,
  recipientWalletAddress,
  ownerWalletAddress,
  batchId = null,
}: RecordPayoutParams): Promise<{ success: boolean; employeeId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Step 1: Look up the employee by wallet address AND owner wallet
    const { data: employee, error: lookupError } = await supabase
      .from('employees')
      .select('id')
      .eq('wallet_address', recipientWalletAddress)
      .eq('owner_wallet_address', ownerWalletAddress)
      .single()

    if (lookupError || !employee) {
      const errorMsg = `Sync Error: Employee not found for wallet ${recipientWalletAddress}`
      console.error(errorMsg, lookupError)
      return { success: false, error: errorMsg }
    }

    // Step 2: Insert the payout record
    const payoutData: PayoutInsert = {
      owner_wallet_address: ownerWalletAddress,
      employee_id: employee.id,
      amount: transactionResult.amount,
      asset_code: transactionResult.asset,
      transaction_hash: transactionResult.hash,
      status: 'success',
      batch_id: batchId,
    }

    const { data: payout, error: insertError } = await supabase
      .from('payouts')
      .insert(payoutData)
      .select()
      .single()

    if (insertError) {
      const errorMsg = `Sync Error: Failed to record payout for employee ${employee.id}`
      console.error(errorMsg, insertError)
      return { success: false, employeeId: employee.id, error: errorMsg }
    }

    console.log('✅ Payout recorded successfully:', payout.id)
    return { success: true, employeeId: employee.id }

  } catch (error) {
    const errorMsg = 'Sync Error: Unexpected error recording payout'
    console.error(errorMsg, error)
    return { success: false, error: errorMsg }
  }
}

/**
 * Records a failed payout attempt to the database.
 * This helps track failed transactions for auditing purposes.
 * 
 * @param params - The failed payout parameters
 * @returns Success status
 */
export async function recordFailedPayout({
  recipientWalletAddress,
  ownerWalletAddress,
  amount,
  asset,
  batchId = null,
}: {
  recipientWalletAddress: string
  ownerWalletAddress: string
  amount: number
  asset: string
  batchId?: string | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    // Look up the employee by wallet address AND owner wallet
    const { data: employee, error: lookupError } = await supabase
      .from('employees')
      .select('id')
      .eq('wallet_address', recipientWalletAddress)
      .eq('owner_wallet_address', ownerWalletAddress)
      .single()

    if (lookupError || !employee) {
      console.error(`Sync Error: Employee not found for wallet ${recipientWalletAddress}`)
      return { success: false, error: 'Employee not found' }
    }

    // Insert the failed payout record
    const payoutData: PayoutInsert = {
      owner_wallet_address: ownerWalletAddress,
      employee_id: employee.id,
      amount: amount,
      asset_code: asset,
      transaction_hash: null,
      status: 'failed',
      batch_id: batchId,
    }

    const { error: insertError } = await supabase
      .from('payouts')
      .insert(payoutData)

    if (insertError) {
      console.error('Sync Error: Failed to record failed payout', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('⚠️ Failed payout recorded for employee:', employee.id)
    return { success: true }

  } catch (error) {
    console.error('Sync Error: Unexpected error recording failed payout', error)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * Creates a batch record for bulk payment operations.
 * Returns the batch ID to be used when recording individual payouts.
 * 
 * @param name - Name/description of the batch
 * @param totalUsd - Total USD value of all payments in the batch
 * @returns Batch ID or null if creation fails
 */
export async function createPayoutBatch(
  name: string,
  totalUsd: number,
  ownerWalletAddress: string
): Promise<{ batchId: string | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('batches')
      .insert({
        owner_wallet_address: ownerWalletAddress,
        name,
        total_usd: totalUsd,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Sync Error: Failed to create batch', error)
      return { batchId: null, error: error?.message }
    }

    console.log('✅ Batch created:', data.id)
    return { batchId: data.id }

  } catch (error) {
    console.error('Sync Error: Unexpected error creating batch', error)
    return { batchId: null, error: 'Unexpected error' }
  }
}
