# Database Setup Instructions

## Quick Setup (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://prmadhgruadckbessift.supabase.co
   - Navigate to: SQL Editor (left sidebar)

2. **Run the Schema:**
   - Click "New query"
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Tables:**
   - Go to: Table Editor (left sidebar)
   - You should see three tables: `employees`, `batches`, `payouts`

## What This Creates

- **employees** - Store team members with wallet addresses
- **batches** - Track bulk payment operations
- **payouts** - Record all payment transactions

## Row Level Security (RLS)

The schema enables RLS with permissive policies for development. For production, you should:

1. Implement proper authentication
2. Update policies to restrict based on user roles
3. Consider adding `user_id` or organization fields

## Verification

After running the migration, test by adding an employee through your app!
