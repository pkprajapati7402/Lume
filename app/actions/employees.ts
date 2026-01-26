'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { EmployeeInsert, PayoutInsert } from '@/types/database'

export async function addEmployee(formData: FormData) {
  const name = formData.get('name') as string
  const walletAddress = formData.get('walletAddress') as string
  const role = formData.get('role') as string
  const preferredAsset = formData.get('preferredAsset') as string
  const department = formData.get('department') as string
  const ownerWallet = formData.get('ownerWallet') as string

  if (!name || !walletAddress || !ownerWallet) {
    return { error: 'Name, wallet address, and owner wallet are required' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const newEmployee: EmployeeInsert = {
      owner_wallet_address: ownerWallet,
      full_name: name,
      wallet_address: walletAddress,
      role: role || 'Employee',
      preferred_asset: preferredAsset || 'USDC',
      department: department || 'General',
    }

    const { data, error } = await supabase
      .from('employees')
      .insert(newEmployee)
      .select()
      .single()

    if (error) {
      console.error('Error adding employee:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, data }
  } catch (error) {
    console.error('Failed to add employee:', error)
    return { error: 'Failed to add employee' }
  }
}

export async function deleteEmployee(employeeId: string, ownerWallet: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)
      .eq('owner_wallet_address', ownerWallet)

    if (error) {
      console.error('Error deleting employee:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return { error: 'Failed to delete employee' }
  }
}

export async function getEmployees(ownerWallet: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('owner_wallet_address', ownerWallet)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return { error: error.message, data: [] }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return { error: 'Failed to fetch employees', data: [] }
  }
}

export async function bulkAddEmployees(
  employees: Array<{
    name: string
    walletAddress: string
    role?: string
    department?: string
    preferredAsset?: string
  }>,
  ownerWallet: string
) {
  try {
    const supabase = await createServerSupabaseClient()

    const employeeData = employees.map(emp => ({
      owner_wallet_address: ownerWallet,
      full_name: emp.name,
      wallet_address: emp.walletAddress,
      role: emp.role || 'Employee',
      preferred_asset: emp.preferredAsset || 'USDC',
      department: emp.department || 'General',
    }))

    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()

    if (error) {
      console.error('Error bulk adding employees:', error)
      return { error: error.message, count: 0 }
    }

    revalidatePath('/dashboard')
    return { success: true, count: data?.length || 0, error: null }
  } catch (error) {
    console.error('Failed to bulk add employees:', error)
    return { error: 'Failed to bulk add employees', count: 0 }
  }
}

/**
 * Server action to record a successful payout after Stellar transaction completes
 */
export async function recordPayoutAction(params: {
  transactionHash: string
  amount: number
  assetCode: string
  recipientWalletAddress: string
  ownerWalletAddress: string
  batchId?: string | null
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Look up the employee by wallet address AND owner wallet
    const { data: employee, error: lookupError } = await supabase
      .from('employees')
      .select('id')
      .eq('wallet_address', params.recipientWalletAddress)
      .eq('owner_wallet_address', params.ownerWalletAddress)
      .single()

    if (lookupError || !employee) {
      const errorMsg = `Employee not found for wallet ${params.recipientWalletAddress}`
      console.error('Payout recording error:', errorMsg, lookupError)
      return { success: false, error: errorMsg }
    }

    // Insert the payout record
    const payoutData: PayoutInsert = {
      owner_wallet_address: params.ownerWalletAddress,
      employee_id: employee.id,
      amount: params.amount,
      asset_code: params.assetCode,
      transaction_hash: params.transactionHash,
      status: 'success',
      batch_id: params.batchId || null,
    }

    const { data: payout, error: insertError } = await supabase
      .from('payouts')
      .insert(payoutData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting payout:', insertError)
      return { success: false, error: insertError.message, employeeId: employee.id }
    }

    console.log('✅ Payout recorded successfully:', payout.id)
    revalidatePath('/dashboard')
    return { success: true, employeeId: employee.id, payoutId: payout.id }

  } catch (error) {
    console.error('Unexpected error recording payout:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Fetch payouts with employee information for transaction history
 */
export async function getPayoutHistory(ownerWallet: string, limit: number = 50) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('payouts')
      .select(`
        id,
        transaction_hash,
        amount,
        asset_code,
        status,
        created_at,
        employee_id,
        employees!inner (
          full_name,
          wallet_address
        )
      `)
      .eq('owner_wallet_address', ownerWallet)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching payout history:', error)
      return { data: [], error: error.message }
    }

    // Transform the data to flatten employee info
    const transformedData = data.map((payout: any) => ({
      id: payout.id,
      transactionHash: payout.transaction_hash,
      amount: payout.amount,
      assetCode: payout.asset_code,
      status: payout.status,
      createdAt: payout.created_at,
      employeeName: payout.employees?.full_name || 'Unknown',
      walletAddress: payout.employees?.wallet_address || '',
    }))

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Unexpected error fetching payout history:', error)
    return { data: [], error: 'Unexpected error occurred' }
  }
}

