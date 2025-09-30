# Technical Architecture - User Dashboard

## 🏗️ System Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Chakra UI
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Language**: TypeScript

### Component Structure

```
app/
├── user-dashboard/
│   ├── page.tsx (Main dashboard with search)
│   ├── orders/
│   │   ├── page.tsx (Orders list)
│   │   └── [id]/page.tsx (Order details)
│   ├── stores/
│   │   ├── page.tsx (Stores list)
│   │   └── [id]/
│   │       ├── page.tsx (Store details)
│   │       └── items/page.tsx (Store items with filters)
│   └── profile/
│       └── page.tsx (User profile)
└── dashboard/
    └── page.tsx (Redirect to user-dashboard)
```

## 🔧 Core Components

### 1. Main Dashboard (`/user-dashboard/page.tsx`)

**State Management**:
```typescript
const [activeIndex, setActiveIndex] = useState(0);
const [activeTab, setActiveTab] = useState("overview");
const [selectedCategory, setSelectedCategory] = useState<string>("");
const [searchQuery, setSearchQuery] = useState<string>("");
const [searchResults, setSearchResults] = useState<any[]>([]);
const [isSearching, setIsSearching] = useState<boolean>(false);
```

**Key Functions**:
- `handleSearch()` - Global search across all vendors
- `renderContent()` - Tab-based content rendering
- `SearchResults()` - Search results component
- `SavedVendors()` - Saved stores component
- `CategoryTab()` - Category-filtered stores
- `OrdersTab()` - Orders list component
- `SupportTickets()` - Support system

**Data Fetching**:
```typescript
const { data: vendors, isLoading: vendorsLoading } = useQuery({
  queryKey: ["vendors"],
  queryFn: api.vendors,
  refetchInterval: 10000,
  refetchOnWindowFocus: true,
  staleTime: 5000,
});
```

### 2. Search System

**Algorithm Flow**:
```
User Input → handleSearch()
    ↓
Iterate through vendors
    ↓
Fetch items for each vendor (api.vendorItems)
    ↓
Filter items by query (name, category, description)
    ↓
Aggregate results with vendor info
    ↓
Display in SearchResults component
```

**Search Implementation**:
```typescript
const handleSearch = async (query: string) => {
  setSearchQuery(query);
  if (!query.trim()) {
    setSearchResults([]);
    setActiveTab("overview");
    return;
  }

  setIsSearching(true);
  try {
    const allItems: any[] = [];
    for (const vendor of vendorList) {
      const itemsData = await api.vendorItems(vendor._id || vendor.id);
      const items = (itemsData as any)?.data || itemsData || [];
      items.forEach((item: any) => {
        if (item.name?.toLowerCase().includes(query.toLowerCase()) ||
            item.category?.toLowerCase().includes(query.toLowerCase()) ||
            item.desc?.toLowerCase().includes(query.toLowerCase())) {
          allItems.push({
            ...item,
            vendor: vendor,
            vendorName: vendor.name || vendor.businessName,
            vendorId: vendor._id || vendor.id
          });
        }
      });
    }
    setSearchResults(allItems);
    setActiveTab("search");
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    setIsSearching(false);
  }
};
```

### 3. API Layer (`/lib/api.ts`)

**Base Configuration**:
```typescript
export async function apiFetch<T>(
  path: string,
  options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    cache: "no-store",
  });

  // ... error handling and response parsing
}
```

**API Endpoints**:
```typescript
export const api = {
  // User
  me: () => apiFetch("/api/user/me"),
  updateUser: (id: string, body: any) => apiFetch(`/api/user/${id}`, { method: "PATCH", body }),
  
  // Orders
  orders: () => apiFetch("/api/orders"),
  ordersByCustomer: (customerId: string) => apiFetch(`/api/orders?customerId=${encodeURIComponent(customerId)}`),
  order: (id: string) => apiFetch(`/api/orders/${id}`),
  checkout: (body: any) => apiFetch(`/api/orders/checkout`, { method: "POST", body }),
  
  // Vendors
  vendors: () => apiFetch(`/api/vendors`),
  vendor: (id: string) => apiFetch(`/api/vendors/${id}`),
  vendorItems: (id: string) => apiFetch(`/api/vendors/${id}/items`),
  likeVendor: (id: string) => apiFetch(`/api/vendors/${id}/like`, { method: "POST" }),
  unlikeVendor: (id: string) => apiFetch(`/api/vendors/${id}/like`, { method: "DELETE" }),
  savedVendors: () => apiFetch(`/api/vendors/saved/me`),
  
  // Search (NEW)
  searchItems: (query: string) => apiFetch(`/api/items/search?q=${encodeURIComponent(query)}`),
  allVendorsWithItems: () => apiFetch(`/api/vendors/with-items`),
  
  // Support
  createSupportTicket: (body: { subject: string; message: string }) => apiFetch(`/api/support/tickets`, { method: "POST", body }),
  mySupportTickets: () => apiFetch(`/api/support/tickets`),
  
  // Wallet
  walletTransactions: () => apiFetch(`/api/user/wallet/transactions`),
  initTopup: (body: any) => apiFetch(`/api/wallet/initializeTransaction`, { method: "POST", body }),
  
  // Cart
  cartItems: (id: string) => apiFetch(`/api/carts/${id}/items`),
  
  // Notifications
  registerDevice: (token: string) => apiFetch(`/api/notifications/registerDevice`, { method: "POST", body: { token } }),
};
```

## 🎨 UI Components

### Reusable Components

**Card Component** (`/app/components/Card.tsx`):
```typescript
interface CardProps extends BoxProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outline" | "filled" | "glass" | "gradient";
  hover?: boolean;
  interactive?: boolean;
}
```

**Wrapper Component** (`/app/components/Wrapper.tsx`):
```typescript
interface WrapperProps extends BoxProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'section' | 'container';
}
```

### Animation System

**Framer Motion Integration**:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
>
  {/* Content */}
</motion.div>
```

**Chakra UI Animations**:
```typescript
<Fade in={isLoaded} transition={{ enter: { duration: 0.6 } }}>
  <SlideFade in={isLoaded} offsetY="20px">
    <ScaleFade in={isLoaded} initialScale={0.95}>
      {/* Content */}
    </ScaleFade>
  </SlideFade>
</Fade>
```

## 🔄 Data Flow

### Search Flow
```
User Types → Input onChange
    ↓
handleSearch(query)
    ↓
setIsSearching(true)
    ↓
Fetch all vendor items
    ↓
Filter & aggregate results
    ↓
setSearchResults(results)
    ↓
setActiveTab("search")
    ↓
SearchResults component renders
```

### Navigation Flow
```
User clicks store card
    ↓
router.push(`/user-dashboard/stores/${storeId}`)
    ↓
Store details page loads
    ↓
User clicks "Browse items"
    ↓
router.push(`/user-dashboard/stores/${storeId}/items`)
    ↓
Items page with category filter
```

## 🔐 Authentication

**Token Management**:
```typescript
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("boiboi_token");
  } catch {
    return null;
  }
}
```

**Route Protection**:
```typescript
useEffect(() => {
  const token = getAuthToken();
  if (!token) router.replace("/login");
}, [router]);
```

## 📊 State Management Strategy

### React Query Configuration
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["vendors"],
  queryFn: api.vendors,
  refetchInterval: 10000,      // Auto-refresh every 10s
  refetchOnWindowFocus: true,  // Refresh on tab focus
  staleTime: 5000,             // Data fresh for 5s
});
```

### Local State
- Component-level state for UI interactions
- Search state for real-time filtering
- Tab state for view switching

### Server State
- React Query for API data caching
- Automatic background refetching
- Optimistic updates for mutations

## 🎯 Performance Optimizations

1. **Lazy Loading**: Components load on demand
2. **Memoization**: useMemo for expensive computations
3. **Debouncing**: Search input debouncing (can be added)
4. **Caching**: React Query automatic caching
5. **Code Splitting**: Next.js automatic code splitting
6. **Image Optimization**: Next.js Image component
7. **Prefetching**: Link prefetching for faster navigation

## 🧪 Testing Strategy

### Unit Tests (Recommended)
- Test search algorithm
- Test filter functions
- Test currency formatting
- Test data transformations

### Integration Tests (Recommended)
- Test navigation flows
- Test search functionality
- Test API integration
- Test authentication

### E2E Tests (Recommended)
- Test complete user journeys
- Test search to order flow
- Test store browsing
- Test order tracking

## 🚀 Deployment Considerations

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here
```

### Build Optimization
```bash
npm run build
npm run start
```

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Error tracking (Sentry recommended)
- User analytics (Google Analytics recommended)

## 📈 Scalability

### Current Limitations
- Search fetches all vendor items (can be optimized)
- No pagination on search results
- No result caching between searches

### Future Improvements
1. **Backend Search API**: Move search logic to backend
2. **Elasticsearch**: Implement full-text search
3. **Redis Caching**: Cache search results
4. **Pagination**: Implement infinite scroll
5. **Debouncing**: Add search input debouncing
6. **Web Workers**: Offload search computation
7. **Service Workers**: Offline search capability

## 🔧 Maintenance

### Code Organization
- Feature-based folder structure
- Reusable components in `/components`
- Shared utilities in `/lib`
- Type definitions in component files

### Best Practices
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Git hooks for pre-commit checks

---

**Architecture designed for scalability, maintainability, and optimal user experience.**
