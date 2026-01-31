// Database Types for Supabase PostgreSQL Schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// User role type
export type UserRoleType = 'employer' | 'employee'

// Transaction status type
export type TransactionStatus = 'pending' | 'success' | 'failed'

// Investment status type  
export type InvestmentStatus = 'active' | 'withdrawn' | 'pending'

// Notification type
export type NotificationType = 'payment_received' | 'payment_sent' | 'goal_reached' | 'investment_update' | 'system'

// Network type
export type NetworkType = 'testnet' | 'mainnet'

export interface Database {
  public: {
    Tables: {
      // ============================================
      // USER PROFILES - Role and preferences
      // ============================================
      user_profiles: {
        Row: {
          id: string
          wallet_address: string
          user_role: UserRoleType
          display_name: string | null
          email: string | null
          avatar_url: string | null
          preferred_currency: string
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          user_role?: UserRoleType
          display_name?: string | null
          email?: string | null
          avatar_url?: string | null
          preferred_currency?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          user_role?: UserRoleType
          display_name?: string | null
          email?: string | null
          avatar_url?: string | null
          preferred_currency?: string
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // ============================================
      // EMPLOYEES - Employer's employee records
      // ============================================
      employees: {
        Row: {
          id: string
          owner_wallet_address: string
          full_name: string
          wallet_address: string
          role: string
          preferred_asset: string
          department: string
          employee_type: 'employee' | 'contractor'
          tax_rate: number
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
          employee_type?: 'employee' | 'contractor'
          tax_rate?: number
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
          employee_type?: 'employee' | 'contractor'
          tax_rate?: number
          created_at?: string
        }
      }
      // ============================================
      // EMPLOYEE TRANSACTIONS - Employee-initiated payments
      // ============================================
      employee_transactions: {
        Row: {
          id: string
          sender_wallet_address: string
          recipient_wallet_address: string
          recipient_name: string | null
          amount: number
          asset_code: string
          asset_issuer: string | null
          transaction_hash: string | null
          memo: string | null
          category: string
          status: TransactionStatus
          network: NetworkType
          fee_amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_wallet_address: string
          recipient_wallet_address: string
          recipient_name?: string | null
          amount: number
          asset_code?: string
          asset_issuer?: string | null
          transaction_hash?: string | null
          memo?: string | null
          category?: string
          status?: TransactionStatus
          network?: NetworkType
          fee_amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_wallet_address?: string
          recipient_wallet_address?: string
          recipient_name?: string | null
          amount?: number
          asset_code?: string
          asset_issuer?: string | null
          transaction_hash?: string | null
          memo?: string | null
          category?: string
          status?: TransactionStatus
          network?: NetworkType
          fee_amount?: number | null
          created_at?: string
        }
      }
      // ============================================
      // SPENDING CATEGORIES
      // ============================================
      spending_categories: {
        Row: {
          id: string
          wallet_address: string
          name: string
          icon: string
          color: string
          budget_limit: number | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          name: string
          icon?: string
          color?: string
          budget_limit?: number | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          name?: string
          icon?: string
          color?: string
          budget_limit?: number | null
          is_default?: boolean
          created_at?: string
        }
      }
      // ============================================
      // SAVINGS GOALS
      // ============================================
      savings_goals: {
        Row: {
          id: string
          wallet_address: string
          name: string
          target_amount: number
          current_amount: number
          asset_code: string
          target_date: string | null
          icon: string
          color: string
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          name: string
          target_amount: number
          current_amount?: number
          asset_code?: string
          target_date?: string | null
          icon?: string
          color?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          name?: string
          target_amount?: number
          current_amount?: number
          asset_code?: string
          target_date?: string | null
          icon?: string
          color?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // ============================================
      // LIQUIDITY INVESTMENTS
      // ============================================
      liquidity_investments: {
        Row: {
          id: string
          wallet_address: string
          pool_id: string
          pool_name: string
          asset_a_code: string
          asset_b_code: string
          shares_amount: number
          deposit_amount_a: number | null
          deposit_amount_b: number | null
          deposit_transaction_hash: string | null
          status: InvestmentStatus
          network: NetworkType
          created_at: string
          withdrawn_at: string | null
        }
        Insert: {
          id?: string
          wallet_address: string
          pool_id: string
          pool_name: string
          asset_a_code: string
          asset_b_code: string
          shares_amount: number
          deposit_amount_a?: number | null
          deposit_amount_b?: number | null
          deposit_transaction_hash?: string | null
          status?: InvestmentStatus
          network?: NetworkType
          created_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          id?: string
          wallet_address?: string
          pool_id?: string
          pool_name?: string
          asset_a_code?: string
          asset_b_code?: string
          shares_amount?: number
          deposit_amount_a?: number | null
          deposit_amount_b?: number | null
          deposit_transaction_hash?: string | null
          status?: InvestmentStatus
          network?: NetworkType
          created_at?: string
          withdrawn_at?: string | null
        }
      }
      // ============================================
      // CONTACTS - Address book
      // ============================================
      contacts: {
        Row: {
          id: string
          owner_wallet_address: string
          contact_wallet_address: string
          contact_name: string
          contact_email: string | null
          notes: string | null
          is_favorite: boolean
          last_payment_at: string | null
          payment_count: number
          created_at: string
        }
        Insert: {
          id?: string
          owner_wallet_address: string
          contact_wallet_address: string
          contact_name: string
          contact_email?: string | null
          notes?: string | null
          is_favorite?: boolean
          last_payment_at?: string | null
          payment_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          owner_wallet_address?: string
          contact_wallet_address?: string
          contact_name?: string
          contact_email?: string | null
          notes?: string | null
          is_favorite?: boolean
          last_payment_at?: string | null
          payment_count?: number
          created_at?: string
        }
      }
      // ============================================
      // NOTIFICATIONS
      // ============================================
      notifications: {
        Row: {
          id: string
          wallet_address: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          metadata?: Json | null
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
          tax_withheld: number
          net_amount: number
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
          tax_withheld?: number
          net_amount?: number
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
          tax_withheld?: number
          net_amount?: number
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
// ============================================
// EMPLOYER TABLES
// ============================================
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

// ============================================
// USER PROFILES
// ============================================
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

// ============================================
// EMPLOYEE TRANSACTIONS
// ============================================
export type EmployeeTransaction = Database['public']['Tables']['employee_transactions']['Row']
export type EmployeeTransactionInsert = Database['public']['Tables']['employee_transactions']['Insert']
export type EmployeeTransactionUpdate = Database['public']['Tables']['employee_transactions']['Update']

// ============================================
// SPENDING CATEGORIES
// ============================================
export type SpendingCategory = Database['public']['Tables']['spending_categories']['Row']
export type SpendingCategoryInsert = Database['public']['Tables']['spending_categories']['Insert']
export type SpendingCategoryUpdate = Database['public']['Tables']['spending_categories']['Update']

// ============================================
// SAVINGS GOALS
// ============================================
export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']
export type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert']
export type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update']

// ============================================
// LIQUIDITY INVESTMENTS
// ============================================
export type LiquidityInvestment = Database['public']['Tables']['liquidity_investments']['Row']
export type LiquidityInvestmentInsert = Database['public']['Tables']['liquidity_investments']['Insert']
export type LiquidityInvestmentUpdate = Database['public']['Tables']['liquidity_investments']['Update']

// ============================================
// CONTACTS
// ============================================
export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

// ============================================
// NOTIFICATIONS
// ============================================
export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

