# Mobile Dropdown Component Usage

## Overview
A professional, mobile-optimized dropdown component with smooth animations and a bottom sheet design.

## Features
- ✅ 3D card-style trigger button
- ✅ Bottom sheet modal on mobile
- ✅ Smooth slide-up animation
- ✅ Backdrop blur effect
- ✅ Icon support for options
- ✅ Selected state indication
- ✅ Touch-friendly design
- ✅ Auto-close on outside click
- ✅ Safe area support for notched devices

## Basic Usage

```tsx
import MobileDropdown from '@/app/components/MobileDropdown';
import { FiCreditCard, FiDollarSign, FiGift } from 'react-icons/fi';

const [selectedPayment, setSelectedPayment] = useState('card');

<MobileDropdown
  label="Payment Method"
  placeholder="Select payment method"
  value={selectedPayment}
  onChange={setSelectedPayment}
  options={[
    {
      label: 'Credit Card',
      value: 'card',
      icon: FiCreditCard,
      description: 'Pay with your saved card'
    },
    {
      label: 'Wallet',
      value: 'wallet',
      icon: FiDollarSign,
      description: 'Use your wallet balance'
    },
    {
      label: 'Coupon',
      value: 'coupon',
      icon: FiGift,
      description: 'Apply a discount code'
    }
  ]}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `options` | `DropdownOption[]` | Yes | Array of dropdown options |
| `value` | `string` | Yes | Currently selected value |
| `onChange` | `(value: string) => void` | Yes | Callback when selection changes |
| `placeholder` | `string` | No | Placeholder text when no selection |
| `label` | `string` | No | Label above the dropdown |

## DropdownOption Interface

```typescript
interface DropdownOption {
  label: string;        // Display text
  value: string;        // Unique identifier
  icon?: any;          // Optional React Icon component
  description?: string; // Optional subtitle text
}
```

## Example: Order Status Filter

```tsx
import { FiClock, FiCheck, FiX, FiTruck } from 'react-icons/fi';

<MobileDropdown
  label="Order Status"
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    {
      label: 'All Orders',
      value: 'all',
      icon: FiClock,
      description: 'View all your orders'
    },
    {
      label: 'Completed',
      value: 'completed',
      icon: FiCheck,
      description: 'Successfully delivered'
    },
    {
      label: 'In Transit',
      value: 'transit',
      icon: FiTruck,
      description: 'On the way to you'
    },
    {
      label: 'Cancelled',
      value: 'cancelled',
      icon: FiX,
      description: 'Cancelled orders'
    }
  ]}
/>
```

## Styling Customization

The component uses Chakra UI and can be customized via theme or inline styles:

```tsx
<Box maxW="400px" mx="auto">
  <MobileDropdown
    // ... props
  />
</Box>
```

## Mobile Behavior

- On mobile: Opens as a bottom sheet with backdrop
- Smooth slide-up animation
- Prevents body scroll when open
- Closes on backdrop click or option selection
- Handle bar for visual affordance

## Desktop Behavior

- Same bottom sheet design (can be modified for desktop dropdown if needed)
- Keyboard accessible
- Click outside to close
