# Stores Fetching Debug Guide

## Issue
Stores are not fetching on the landing page.

## What I've Added

### Enhanced Logging
Added comprehensive console logging to track the entire fetch process:

```typescript
console.log('🔄 Fetching vendors...');
console.log('✅ Token found, using authenticated API');
console.log('📡 No token, fetching public vendors');
console.log('📡 Response status:', response.status);
console.log('✅ Vendors fetched:', data);
console.log('❌ Error:', error);
```

### Improved Error Handling
- Added retry logic (1 retry with 1 second delay)
- Better error logging with response details
- Query error tracking with useEffect

## How to Debug

### Step 1: Open Browser Console
1. Open your app in the browser
2. Press F12 or right-click → Inspect
3. Go to the "Console" tab

### Step 2: Check the Logs
Look for these messages:

**Success Case:**
```
🔄 Fetching vendors...
📡 No token, fetching public vendors
📡 Response status: 200
✅ Vendors fetched (public): { data: [...] }
```

**Error Case:**
```
🔄 Fetching vendors...
📡 No token, fetching public vendors
📡 Response status: 404 (or other error)
❌ Public API call failed: 404 Not Found
❌ Error response: ...
```

### Step 3: Check Network Tab
1. Go to "Network" tab in DevTools
2. Refresh the page
3. Look for the request to `/api/vendors`
4. Check:
   - Status code (should be 200)
   - Response data
   - Request headers

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom:** Console shows CORS policy error
**Solution:** Backend needs to allow your frontend origin

### Issue 2: 404 Not Found
**Symptom:** Response status: 404
**Solution:** 
- Check if backend is running
- Verify the endpoint URL is correct
- Check if `/api/vendors` route exists on backend

### Issue 3: 401 Unauthorized
**Symptom:** Response status: 401
**Solution:** 
- The endpoint might require authentication
- Check if the endpoint should be public

### Issue 4: Empty Array Returned
**Symptom:** Vendors fetched but array is empty
**Solution:**
- Check if there are vendors in the database
- Verify the backend is returning data correctly

### Issue 5: Network Error
**Symptom:** Failed to fetch / Network request failed
**Solution:**
- Check if backend server is running
- Verify the BASE_URL is correct
- Check your internet connection

## API Endpoints

### Current Configuration
```typescript
BASE_URL = "https://useboiboi.onrender.com"
Endpoint = "/api/vendors"
Full URL = "https://useboiboi.onrender.com/api/vendors"
```

### Test the API Directly
Open this URL in your browser:
```
https://useboiboi.onrender.com/api/vendors
```

You should see JSON data with vendors.

## Expected Response Format

The API should return data in one of these formats:

**Format 1: Wrapped in data property**
```json
{
  "data": [
    {
      "id": "123",
      "name": "Store Name",
      "businessName": "Business Name",
      "image": "url",
      "rating": 4.5,
      "description": "Store description"
    }
  ]
}
```

**Format 2: Direct array**
```json
[
  {
    "id": "123",
    "name": "Store Name",
    ...
  }
]
```

The code handles both formats:
```typescript
const vendors = (data as any)?.data || data || [];
```

## Quick Fixes

### Fix 1: Change API URL
If the current URL doesn't work, try updating the endpoint:

```typescript
// In frontend/app/lib/endpoints.ts
export const BASE_URL = "YOUR_BACKEND_URL_HERE"
```

### Fix 2: Use Mock Data (Temporary)
For testing, you can add mock data:

```typescript
const { data, isLoading } = useQuery({ 
  queryKey: ["public-vendors"], 
  queryFn: async () => {
    // Return mock data for testing
    return {
      data: [
        {
          id: "1",
          businessName: "Test Store 1",
          name: "Test Store 1",
          image: "/food-carousel.png",
          rating: 4.5,
          description: "Test store description"
        },
        {
          id: "2",
          businessName: "Test Store 2",
          name: "Test Store 2",
          image: "/food-carousel-2.png",
          rating: 4.8,
          description: "Another test store"
        }
      ]
    };
  }
});
```

### Fix 3: Check Backend Status
Test if the backend is running:

```bash
# In your terminal
curl https://useboiboi.onrender.com/api/vendors
```

Or use a tool like Postman to test the endpoint.

## Next Steps

1. **Check Console Logs** - See what's being logged
2. **Check Network Tab** - See the actual API request/response
3. **Test API Directly** - Open the URL in browser
4. **Check Backend** - Ensure it's running and returning data
5. **Report Findings** - Share the console logs and network response

## Contact Points

If the issue persists, check:
- [ ] Backend server is running
- [ ] Database has vendor data
- [ ] API endpoint is accessible
- [ ] CORS is configured correctly
- [ ] Network connection is stable
