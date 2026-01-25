'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { EmployeeInsert } from '@/types/database'

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
