# 🧪 Compliance & Tax Reporting - Testing Guide

## Quick Test Checklist

### Pre-Requisites
- [ ] Run database migration: `supabase/migrations/add_tax_columns.sql`
- [ ] At least one employee in Directory
- [ ] At least one successful payment transaction
- [ ] Packages installed: `jspdf`, `json-2-csv`

---

## Test Scenarios

### ✅ Test 1: Access Compliance Dashboard
**Steps:**
1. Login to dashboard with Freighter wallet
2. Click "Compliance" in left sidebar navigation
3. Verify page loads with 5 summary stat cards
4. Check for YTD Summary table

**Expected Result:**
- Compliance section loads without errors
- Summary cards show: Total Gross Pay, Tax Withheld, Net Disbursed, W-2 Count, 1099 Count
- Table displays employees with payment data

---

### ✅ Test 2: Filter by Year
**Steps:**
1. Navigate to Compliance section
2. Click Year dropdown in filters
3. Select different year (e.g., 2024)
4. Verify data refreshes

**Expected Result:**
- Only transactions from selected year appear
- Summary stats recalculate
- "Showing X of Y employees" count updates

---

### ✅ Test 3: Filter by Employee Type
**Steps:**
1. In Compliance section, click Employee Type dropdown
2. Select "W-2 Employees"
3. Verify only employees with `employee_type = 'employee'` show
4. Switch to "1099-NEC Contractors"
5. Verify only contractors show

**Expected Result:**
- Table filters correctly by employee type
- Stats recalculate for filtered subset
- Filter indicator shows current selection

---

### ✅ Test 4: Search Employees
**Steps:**
1. Type employee name in search box (e.g., "John")
2. Verify table filters in real-time
3. Try searching by wallet address partial
4. Try searching by department

**Expected Result:**
- Table shows matching results
- Search is case-insensitive
- Stats update to reflect filtered data

---

### ✅ Test 5: Generate W-2 PDF
**Steps:**
1. Find employee with `employee_type = 'employee'` and successful payments
2. Click "Generate Form" button
3. Review modal with employee details
4. Click "Download W-2 Form"
5. Check Downloads folder for PDF file

**Expected Result:**
- Modal opens with employee info and tax summary
- PDF downloads with filename: `LUME_W-2_[Name]_[Year].pdf`
- PDF contains:
  - LUME branding header
  - Employee information
  - Tax summary boxes (Gross, Withheld, Net)
  - Transaction table with up to 15 transactions
  - "LUME Verified" badge in footer
  - Stellar Expert verification note

---

### ✅ Test 6: Generate 1099-NEC PDF
**Steps:**
1. Find employee with `employee_type = 'contractor'` and successful payments
2. Click "Generate Form" button
3. Review modal
4. Click "Download 1099-NEC Form"
5. Verify PDF downloads

**Expected Result:**
- Same as Test 5, but with "1099-NEC" label instead of "W-2"
- Filename: `LUME_1099-NEC_[Name]_[Year].pdf`

---

### ✅ Test 7: Export Annual Compliance CSV
**Steps:**
1. Apply filters (Year: 2025, Type: All)
2. Click "Export CSV" button
3. Check Downloads folder for CSV file
4. Open CSV in Excel or Google Sheets

**Expected Result:**
- CSV downloads with filename: `LUME_Annual_Compliance_Report_2025_[Date].csv`
- Contains columns:
  - Employee Name
  - Wallet Address
  - Employee Type (W-2 Employee / 1099-NEC Contractor)
  - Department
  - Tax Rate (%)
  - Total Gross Pay (USD)
  - Tax Withheld (USD)
  - Net Disbursed (USD)
  - Payment Count
  - Year
- Data matches filtered table view

---

### ✅ Test 8: Verify Tax Calculations
**Steps:**
1. Find employee with known tax rate (e.g., 20%)
2. Note their Total Gross Pay in table
3. Calculate expected tax: Gross × (Tax Rate / 100)
4. Compare to Tax Withheld column

**Expected Result:**
- Tax Withheld = Gross Pay × (Tax Rate / 100)
- Net Disbursed = Gross Pay - Tax Withheld
- Effective tax rate in summary card matches calculation

---

### ✅ Test 9: Empty State Handling
**Steps:**
1. Select a year with no transactions (e.g., 2020)
2. Verify empty state message appears
3. Change year back to current year with data

**Expected Result:**
- Shows shield icon with message: "No payments recorded for [Year]"
- No errors or crashes
- Filters remain functional

---

### ✅ Test 10: Stellar Verification Links
**Steps:**
1. Generate any tax form PDF
2. In modal, click "View on Stellar Expert" link
3. Verify link opens Stellar Expert in new tab
4. Check that employee's wallet address loads correctly

**Expected Result:**
- Stellar Expert opens with correct address
- Network matches (testnet or mainnet)
- Transaction history visible on blockchain explorer

---

## Edge Cases to Test

### 🔹 Edge Case 1: Employee with 0 payments
**Expected:** "Generate Form" button is disabled, grayed out

### 🔹 Edge Case 2: Employee with custom tax rate (e.g., 15%)
**Expected:** Tax calculations use 15% instead of default 20%

### 🔹 Edge Case 3: More than 15 transactions
**Expected:** PDF shows first 15 transactions + note about remaining count

### 🔹 Edge Case 4: Special characters in employee name
**Expected:** PDF filename sanitizes spaces/special chars, form displays correctly

### 🔹 Edge Case 5: Filter with no matches
**Expected:** Shows "No employees match your filters" message

---

## Database Verification

### Check Migration Applied
```sql
-- Verify new columns exist
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name IN ('employees', 'payouts')
  AND column_name IN ('employee_type', 'tax_rate', 'tax_withheld', 'net_amount')
ORDER BY table_name, column_name;
```

### Sample Data Query
```sql
-- Check employee types and tax rates
SELECT 
  full_name,
  employee_type,
  tax_rate,
  COUNT(*) as payment_count
FROM employees e
LEFT JOIN payouts p ON e.id = p.employee_id
WHERE p.status = 'success'
GROUP BY e.id, e.full_name, e.employee_type, e.tax_rate;
```

### Verify Tax Calculations
```sql
-- Check tax withheld vs expected
SELECT 
  p.id,
  p.amount as gross,
  e.tax_rate,
  p.tax_withheld,
  p.net_amount,
  (p.amount * e.tax_rate / 100) as expected_tax,
  (p.amount - p.tax_withheld) as expected_net
FROM payouts p
JOIN employees e ON p.employee_id = e.id
WHERE p.status = 'success'
LIMIT 10;
```

---

## Performance Testing

### Load Testing
1. Create 100+ employees
2. Create 1000+ transactions
3. Load Compliance section
4. Verify table renders in < 2 seconds
5. Test filtering performance

### CSV Export Performance
1. Export 500+ employee records
2. Verify CSV generation completes in < 5 seconds
3. Check file size is reasonable (< 5 MB)

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Known Limitations

1. **PDF Generation**: Client-side only (no server rendering)
2. **Transaction Limit in PDF**: Shows max 15 transactions (performance)
3. **Tax Calculations**: Estimates only, not legal tax advice
4. **SSN/EIN**: Not collected (blockchain-native identity)
5. **Pagination**: Currently loads all employees (future: implement pagination)

---

## Troubleshooting

### Issue: "No Compliance Data" despite having payments
**Solution:** 
- Check year filter matches transaction dates
- Verify `status = 'success'` in payouts table
- Confirm `owner_wallet_address` matches logged-in wallet

### Issue: PDF download fails
**Solution:**
- Check browser console for jsPDF errors
- Try different browser (Chrome recommended)
- Verify jsPDF package installed: `npm list jspdf`

### Issue: Tax calculations show $0
**Solution:**
- Run migration script to backfill data
- Check `employee.tax_rate` is set (default 20)
- Verify `payout.tax_withheld` column exists

---

## Success Criteria

✅ All 10 test scenarios pass  
✅ No console errors during usage  
✅ PDFs generate correctly with proper formatting  
✅ CSV exports match table data  
✅ Tax calculations accurate to 2 decimal places  
✅ Filters work in combination (Year + Type + Search)  
✅ Empty states display appropriately  
✅ Mobile responsive (table scrolls horizontally)  
✅ Load time < 3 seconds for 100 employees  

---

**Version:** 1.0.0  
**Last Updated:** January 27, 2026  
**Status:** Ready for QA Testing
