# Database Security Fix - Wallet-Based Data Isolation

## Problem Identified

The previous database schema had a critical security vulnerability where data was shared across all users. When User A connected with Wallet A and added employees, User B connecting with Wallet B could also see User A's employees, transactions, and other sensitive data.

## Solution Implemented

Added **wallet-based data isolation** by introducing an `owner_wallet_address` column to all tables. Now each record is associated with a specific wallet address, ensuring complete data separation between users.

## Changes Made

### 1. Database Schema (`supabase/schema.sql`)

#### Added `owner_wallet_address` column to:
- **employees table**: Tracks which wallet owns each employee record
- **batches table**: Tracks which wallet created each batch
- **payouts table**: Tracks which wallet initiated each payout

#### Updated Constraints:
- Changed employee wallet uniqueness from global to per-owner: `UNIQUE(owner_wallet_address, wallet_address)`
- This allows the same employee to work for different employers

#### Updated Indexes:
- Added indexes on `owner_wallet_address` for all tables to optimize wallet-filtered queries

#### Updated RLS Policies:
- RLS is enabled but policies currently allow all operations (set to `true`)
- In production, you should implement proper Supabase Auth integration to automatically filter by authenticated user

### 2. TypeScript Types (`types/database.ts`)

Updated all database types to include `owner_wallet_address`:
```typescript
interface Employee {
  id: string
  owner_wallet_address: string  // NEW
  full_name: string
  wallet_address: string
  // ... other fields
}
```

### 3. Server Actions (`app/actions/employees.ts`)

Updated all employee-related functions to require and filter by `ownerWallet`:

- **`addEmployee(formData)`**: Now requires `ownerWallet` in formData
- **`getEmployees(ownerWallet)`**: Filters employees by owner wallet
- **`deleteEmployee(employeeId, ownerWallet)`**: Ensures only owner can delete
- **`bulkAddEmployees(employees, ownerWallet)`**: Adds owner wallet to all employees

### 4. Payroll Logic (`lib/payroll-logic.ts`)

Updated transaction recording functions:

- **`recordPayout()`**: Now requires and filters by `ownerWalletAddress`
- **`recordFailedPayout()`**: Now requires and filters by `ownerWalletAddress`
- **`createPayoutBatch()`**: Now requires `ownerWalletAddress`

### 5. React Components

Updated all components to pass the connected wallet address:

- **`MainDashboard.tsx`**: Passes `publicKey` to employee queries
- **`DirectorySection.tsx`**: Uses `useAuthStore` to get wallet, passes to all actions
- **`BulkUploadSection.tsx`**: Uses `useAuthStore` to get wallet, passes to bulk upload

## Migration Instructions

### For New Installations:
1. Run the updated `supabase/schema.sql` directly

### For Existing Installations:
1. **BACKUP YOUR DATA FIRST!**
2. Run the migration script: `supabase/migration.sql`
   - This will drop existing tables and recreate them with the new schema
   - All existing data will be lost (backup first if needed)

### Using Supabase CLI:
```bash
# Make sure you're in the project directory
cd /workspaces/Lume

# Apply the migration
supabase db reset
# OR run the migration directly
psql $DATABASE_URL -f supabase/migration.sql
```

## Testing the Fix

1. Connect with Wallet A
2. Add some employees
3. Make some transactions
4. Disconnect and connect with Wallet B
5. Verify you DON'T see Wallet A's employees
6. Add employees for Wallet B
7. Reconnect with Wallet A
8. Verify you still see only your own employees

## Important Notes

### Current RLS Implementation
The RLS policies are currently permissive (`USING (true)`). This is intentional because:
- The application filters data at the query level using `.eq('owner_wallet_address', ownerWallet)`
- You're using Freighter wallet authentication, not Supabase Auth

### For Production:
If you want database-level security, you should:
1. Integrate Supabase Auth with your Freighter wallet
2. Store wallet addresses in Supabase Auth
3. Update RLS policies to use `auth.jwt()` or similar
4. Example policy: 
   ```sql
   CREATE POLICY "Users can view their own employees" ON public.employees
     FOR SELECT USING (owner_wallet_address = current_setting('app.current_wallet'));
   ```

### Security Best Practices:
1. **Never trust client-side filtering** - Always filter at query level
2. **Validate wallet ownership** - Ensure the publicKey from the client matches the owner
3. **Add server-side validation** - Verify signatures if handling sensitive operations
4. **Use prepared statements** - Supabase client handles this automatically
5. **Audit trail** - Consider adding logs for sensitive operations

## API Changes Summary

### Before:
```typescript
await getEmployees()
await addEmployee(formData)
await deleteEmployee(employeeId)
await bulkAddEmployees(employees)
```

### After:
```typescript
await getEmployees(ownerWallet)
await addEmployee(formData) // formData must include ownerWallet
await deleteEmployee(employeeId, ownerWallet)
await bulkAddEmployees(employees, ownerWallet)
```

## Rollback Instructions

If you need to rollback to the previous schema:
1. Restore your database backup
2. Revert the code changes using git:
   ```bash
   git checkout HEAD~1 -- supabase/schema.sql
   git checkout HEAD~1 -- types/database.ts
   git checkout HEAD~1 -- app/actions/employees.ts
   git checkout HEAD~1 -- lib/payroll-logic.ts
   git checkout HEAD~1 -- app/components/
   ```

## Questions or Issues?

If you encounter any issues with the migration or have questions about the implementation, please check:
1. Ensure all components are passing the wallet address correctly
2. Verify the database schema was updated successfully
3. Check browser console for any errors related to missing parameters
4. Ensure Supabase client has proper permissions
