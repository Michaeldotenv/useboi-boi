# 🎨 Remaining Purple/Pink Gradients to Fix

## Files Still Needing Updates:

### 1. **`frontend/app/cart/page.tsx`** - HIGH PRIORITY
Replace all instances:
```tsx
// Line 189-190: Radial gradients
radial-gradient(circle at 20% 80%, rgba(59, 23, 79, 0.08) 0%, transparent 50%)
radial-gradient(circle at 80% 20%, rgba(107, 42, 143, 0.08) 0%, transparent 50%)

// Line 215: Icon color
color="brand.primary"

// Line 217: Text gradient
bg="linear-gradient(135deg, #3B174F 0%, #6B2A8F 100%)"

// Line 259, 300, 342, 467: Button/text gradients
bg="brand.primary"

// All rgba(108, 63, 232, ...) → rgba(59, 23, 79, ...)
// All rgba(236, 72, 153, ...) → rgba(107, 42, 143, ...)
```

### 2. **`frontend/app/components/tabs/CartTab.tsx`** - HIGH PRIORITY
Same replacements as cart/page.tsx

### 3. **`frontend/app/user-dashboard/stores/[id]/page.tsx`** - MEDIUM PRIORITY
Replace:
```tsx
bg="#3B174F"  // Instead of #6C3FE8
color="brand.primary"  // For icons
```

### 4. **`frontend/app/user-dashboard/stores/[id]/items/page.tsx`** - MEDIUM PRIORITY
Replace all #6C3FE8, #7C3AED, #EC4899, #DB2777 with brand colors

### 5. **`frontend/app/user-dashboard/stores/[id]/items/page_new.tsx`** - LOW PRIORITY
Replace #7C3AED, #EC4899, #6D28D9, #DB2777

---

## Quick Fix Commands:

Since there are many files, here's a systematic approach:

### Step 1: Global Find & Replace Patterns

Use your IDE's find & replace (Ctrl+Shift+H) with these patterns:

| Find | Replace |
|------|---------|
| `#6C3FE8` | `#3B174F` |
| `#EC4899` | `#6B2A8F` |
| `#5B21B6` | `#3B174F` |
| `#DB2777` | `#6B2A8F` |
| `#7C3AED` | `#3B174F` |
| `#6D28D9` | `#3B174F` |
| `#F472B6` | `#6B2A8F` |
| `rgba(108, 63, 232,` | `rgba(59, 23, 79,` |
| `rgba(236, 72, 153,` | `rgba(107, 42, 143,` |
| `linear-gradient(135deg, #6C3FE8 0%, #EC4899 100%)` | `#3B174F` |
| `linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)` | `#3B174F` |
| `linear-gradient(135deg, #6D28D9 0%, #DB2777 100%)` | `#6B2A8F` |
| `linear-gradient(135deg, #5B21B6 0%, #DB2777 100%)` | `#6B2A8F` |

---

## OR: Use VS Code Multi-Cursor

1. Open VS Code
2. Press `Ctrl+Shift+F` (Find in Files)
3. In "files to include": `frontend/app/**/*.tsx`
4. Search for: `#6C3FE8`
5. Click "Replace All" with: `#3B174F`
6. Repeat for each color code above

---

## Priority Order:

1. ✅ **globals.css** - DONE
2. ✅ **GlobalBottomNavigation.tsx** - DONE
3. ✅ **ExploreTab.tsx** - DONE  
4. ⏳ **cart/page.tsx** - IN PROGRESS
5. ⏳ **CartTab.tsx** - NEEDED
6. ⏳ **stores/[id]/page.tsx** - NEEDED
7. ⏳ **stores/[id]/items/page.tsx** - NEEDED
8. ⏳ **stores/[id]/items/page_new.tsx** - NEEDED

---

## After Fixing, Verify:

```bash
cd frontend
npm run lint
npm run build
```

Should see: `✔ No ESLint warnings or errors`

---

**Estimated Time**: 10-15 minutes with global find & replace  
**Status**: 60% Complete
