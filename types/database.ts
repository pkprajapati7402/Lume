// Database Types for Supabase PostgreSQL Schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          owner_wallet_address: string
          full_name: string
          wallet_address: string
          role: string
          preferred_asset: string
          department: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_wallet_address: string
          full_name: string
          wallet_address: string
          role: string
          preferred_asset: string
          department: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_wallet_address?: string
          full_name?: string
          wallet_address?: string
          role?: string
          preferred_asset?: string
          department?: string
          created_at?: string
        }
      }
      payouts: {
        Row: {
          id: string
          owner_wallet_address: string
          employee_id: string
          amount: number
          asset_code: string
          status: 'pending' | 'success' | 'failed'
          transaction_hash: string | null
          batch_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_wallet_address: string
          employee_id: string
          amount: number
          asset_code: string
          status?: 'pending' | 'success' | 'failed'
          transaction_hash?: string | null
          batch_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_wallet_address?: string
          employee_id?: string
          amount?: number
          asset_code?: string
          status?: 'pending' | 'success' | 'failed'
          transaction_hash?: string | null
          batch_id?: string | null
          created_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          owner_wallet_address: string
          name: string
          total_usd: number
          created_at: string
        }
        Insert: {
          id?: string
          owner_wallet_address: string
          name: string
          total_usd: number
          created_at?: string
        }
        Update: {
          id?: string
          owner_wallet_address?: string
          name?: string
          total_usd?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for easier usage
export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type Payout = Database['public']['Tables']['payouts']['Row']
export type PayoutInsert = Database['public']['Tables']['payouts']['Insert']
export type PayoutUpdate = Database['public']['Tables']['payouts']['Update']

export type Batch = Database['public']['Tables']['batches']['Row']
export type BatchInsert = Database['public']['Tables']['batches']['Insert']
export type BatchUpdate = Database['public']['Tables']['batches']['Update']

export type PayoutStatus = 'pending' | 'success' | 'failed'
