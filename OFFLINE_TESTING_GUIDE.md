# PharmJam Offline Testing Guide

## Testing Offline Drug Sales with Local Storage and Remote Sync

### 🎯 Test Objectives

- Verify drug sales work completely offline
- Confirm data is stored locally when offline
- Validate automatic sync when internet returns
- Test data integrity throughout the process

## 📋 Pre-Test Setup

### 1. App Preparation

```bash
# Start the PharmJam app
npx expo start

# Open in simulator/device
# Navigate to Login → Dashboard → Product Search
```

### 2. Initial Data Verification

1. **Check System Status**:

   - Tap the status banner or navigate to Dashboard → Sync Status
   - Verify "DataService" is active (not "SimpleDataService")
   - Confirm local database is initialized

2. **Verify Sample Products**:
   - Go to Product Search screen
   - Search for "Paracetamol" or "Ibuprofen"
   - Confirm products load from local database

## 🔬 Test Scenarios

### Test 1: Online Sales (Baseline)

**Purpose**: Establish baseline behavior when online

**Steps**:

1. Ensure device has internet connection
2. Navigate to Product Search
3. Search and add "Paracetamol 500mg" to cart (qty: 2)
4. Add "Ibuprofen 400mg" to cart (qty: 1)
5. Go to Cart → Enter customer name → Checkout
6. Complete payment (Cash)
7. Generate receipt

**Expected Results**:

- ✅ Products found and added to cart
- ✅ Sale completes successfully
- ✅ Receipt generated with sale ID
- ✅ Inventory automatically updated
- ✅ Data synced to Supabase immediately

### Test 2: Offline Sales (Core Test)

**Purpose**: Verify complete offline functionality

**Setup**:

```bash
# Disable internet on your device/simulator
# iOS Simulator: Device → Network Link Conditioning → 100% Loss
# Android Emulator: Settings → Network → Turn off WiFi/Data
# Physical Device: Turn off WiFi and mobile data
```

**Steps**:

1. **Verify Offline Mode**:

   - Check status banner shows "📴 Offline mode"
   - Navigate to System Status screen
   - Confirm "Remote Connection: ❌ Offline"

2. **Perform Offline Sale**:

   - Navigate to Product Search
   - Search for "Amoxicillin" (antibiotic)
   - Add to cart (qty: 1 box)
   - Search for "Vitamin C"
   - Add to cart (qty: 2 bottles)
   - Go to Cart screen

3. **Complete Offline Transaction**:

   - Enter customer name: "John Doe"
   - Tap Checkout
   - Select payment method: "Card"
   - Complete transaction

4. **Verify Local Storage**:
   - Receipt should be generated successfully
   - Note the sale ID and receipt number
   - Check System Status → "Pending Operations" should show > 0

**Expected Results**:

- ✅ Products searchable offline (from local SQLite)
- ✅ Cart functionality works normally
- ✅ Sale processes without internet
- ✅ Receipt generated with valid ID
- ✅ Inventory decremented locally
- ✅ Sale queued for sync (visible in System Status)

### Test 3: Multiple Offline Sales

**Purpose**: Test multiple transactions while offline

**Steps** (while still offline):

1. **Second Sale**:

   - Clear cart or navigate to new sale
   - Add "Aspirin 300mg" (qty: 3)
   - Customer: "Jane Smith", Payment: "Cash"
   - Complete transaction

2. **Third Sale**:

   - Add "Cough Syrup" (qty: 1)
   - Customer: "Bob Wilson", Payment: "Transfer"
   - Complete transaction

3. **Check System Status**:
   - Navigate to System Status
   - Verify "Pending Operations" count increased
   - Check "Local Database: ✅ Healthy"

**Expected Results**:

- ✅ All sales complete successfully offline
- ✅ Each sale gets unique ID and receipt
- ✅ Local inventory updated correctly
- ✅ Multiple operations queued for sync

### Test 4: Sync When Internet Returns

**Purpose**: Verify automatic sync functionality

**Setup**:

```bash
# Re-enable internet connection
# iOS Simulator: Device → Network Link Conditioning → None
# Android Emulator: Turn on WiFi
# Physical Device: Enable WiFi/mobile data
```

**Steps**:

1. **Monitor Automatic Sync**:

   - Status banner should change to "🔄 Syncing..."
   - Watch System Status screen
   - Note "Pending Operations" count decreasing

2. **Verify Sync Completion**:

   - Status should change to "✅ Online and synced"
   - "Pending Operations" should reach 0
   - "Remote Connection: ✅ Connected"

3. **Verify Data Integrity**:
   - Check that all offline sales are now in remote database
   - Verify inventory levels match between local and remote
   - Confirm all receipt numbers are preserved

**Expected Results**:

- ✅ Automatic sync begins within 30 seconds
- ✅ All pending operations sync successfully
- ✅ No data loss during sync process
- ✅ Inventory levels correctly synchronized

### Test 5: Manual Force Sync

**Purpose**: Test manual sync capabilities

**Steps**:

1. **Create Test Data While Online**:

   - Perform one more sale online
   - Note the sale details

2. **Go Offline and Make Changes**:

   - Disable internet again
   - Perform another sale
   - Go to System Status screen

3. **Test Force Sync**:
   - Re-enable internet
   - In System Status, tap "🔄 Force Sync"
   - Monitor sync progress

**Expected Results**:

- ✅ Force sync triggers immediately
- ✅ All data synchronizes correctly
- ✅ No conflicts or data corruption

## 🔍 Data Verification Methods

### 1. Local Database Inspection

```sql
-- Check sales in local SQLite
SELECT * FROM sales ORDER BY created_at DESC;
SELECT * FROM sale_items WHERE sale_id IN (
  SELECT id FROM sales ORDER BY created_at DESC LIMIT 5
);
SELECT * FROM inventory WHERE product_id IN (
  SELECT DISTINCT product_id FROM sale_items
);
```

### 2. System Status Monitoring

- **Real-time Status**: Watch System Status screen during tests
- **Health Metrics**: Monitor local/remote database health
- **Sync Queue**: Track pending operations count
- **Error Logs**: Check for any error messages

### 3. Receipt Verification

- **Unique IDs**: Each receipt should have unique sale ID
- **Timestamps**: Verify timestamps are preserved
- **Customer Data**: Confirm customer names saved correctly
- **Item Details**: Check quantities and prices are accurate

## 🚨 Expected Behaviors

### Normal Operation

- **Offline Mode**: App continues to function normally
- **Local Storage**: All data saved to SQLite immediately
- **UI Feedback**: Status banner shows current connection state
- **Performance**: No noticeable slowdown in offline mode

### Sync Process

- **Automatic**: Sync starts within 30 seconds of reconnection
- **Background**: Sync doesn't block UI interactions
- **Retry Logic**: Failed sync operations retry automatically
- **Completion**: Clear indication when sync is complete

### Error Handling

- **Network Failures**: Graceful degradation to offline mode
- **Database Errors**: Error messages without app crashes
- **Sync Conflicts**: Automatic resolution with logging
- **Data Validation**: Invalid data rejected with clear messages

## 🐛 Troubleshooting Common Issues

### Issue: "SimpleDataService" Instead of "DataService"

**Cause**: SQLite initialization failed
**Solution**:

- Check expo-sqlite installation
- Restart the app
- Check device logs for database errors

### Issue: Sync Not Starting Automatically

**Cause**: Network detection issues
**Solution**:

- Use Force Sync button
- Check internet connectivity
- Restart app to reset network monitoring

### Issue: Data Not Syncing

**Cause**: Supabase configuration or authentication
**Solution**:

- Check Supabase URL and API key
- Verify database schema matches
- Check Supabase dashboard for incoming data

## ✅ Success Criteria

Your offline-first implementation is working correctly if:

1. **Sales Process**: Complete drug sales work offline
2. **Local Storage**: All transaction data saved locally
3. **Inventory Management**: Stock levels update correctly offline
4. **Receipt Generation**: Valid receipts created without internet
5. **Automatic Sync**: Data syncs when connection returns
6. **Data Integrity**: No data loss during offline/online transitions
7. **User Experience**: Clear status indicators and smooth operation

## 📊 Test Results Template

```
Test Date: _________
Tester: ___________

[ ] Test 1: Online Sales (Baseline) - PASS/FAIL
[ ] Test 2: Offline Sales (Core Test) - PASS/FAIL
[ ] Test 3: Multiple Offline Sales - PASS/FAIL
[ ] Test 4: Sync When Internet Returns - PASS/FAIL
[ ] Test 5: Manual Force Sync - PASS/FAIL

Issues Found:
-
-
-

Notes:
-
-
-
```

This comprehensive testing approach will verify that your PharmJam app can handle drug sales completely offline, store all data locally, and seamlessly sync to the remote server when internet connectivity returns.
