# Boiboi App Typography System

## Font Stack

### 1. **Plus Jakarta Sans** (Headings)
- **Usage**: All headings (h1-h6), titles, and display text
- **Characteristics**: Modern, geometric, clean
- **Variable**: `var(--font-jakarta)`
- **Weights**: 200-800

### 2. **Inter** (Body Text)
- **Usage**: Body text, paragraphs, descriptions, UI text
- **Characteristics**: Excellent readability, optimized for screens
- **Variable**: `var(--font-inter)`
- **Weights**: 100-900

### 3. **JetBrains Mono** (Monospace)
- **Usage**: Code snippets, order numbers, tracking IDs, technical data
- **Characteristics**: Clear distinction, professional
- **Variable**: `var(--font-mono)`
- **Weights**: 100-800

## Implementation

### In Chakra UI Components
```tsx
// Headings automatically use Plus Jakarta Sans
<Heading>This uses Plus Jakarta Sans</Heading>

// Body text automatically uses Inter
<Text>This uses Inter</Text>

// For monospace (numbers, codes)
<Text fontFamily="mono">ORDER-12345</Text>
```

### In Custom CSS
```css
/* Heading */
.my-heading {
  font-family: var(--font-jakarta);
}

/* Body */
.my-text {
  font-family: var(--font-inter);
}

/* Monospace */
.my-code {
  font-family: var(--font-mono);
}
```

## Font Weights Guide

### Plus Jakarta Sans (Headings)
- **200**: Extra Light - Subtle large displays
- **300**: Light - Secondary headings
- **400**: Regular - Standard headings
- **500**: Medium - Emphasized headings
- **600**: Semi Bold - Section titles
- **700**: Bold - Main headings
- **800**: Extra Bold - Hero text

### Inter (Body)
- **300**: Light - Captions, footnotes
- **400**: Regular - Body text
- **500**: Medium - Emphasized text
- **600**: Semi Bold - Subheadings, labels
- **700**: Bold - Strong emphasis

### JetBrains Mono (Monospace)
- **400**: Regular - Standard code/numbers
- **500**: Medium - Emphasized data
- **600**: Semi Bold - Important codes
- **700**: Bold - Critical information

## Best Practices

1. **Consistency**: Always use the designated font for its purpose
2. **Hierarchy**: Use font weights to create visual hierarchy
3. **Readability**: Keep body text at 400-500 weight
4. **Contrast**: Use bold weights (600-800) for important information
5. **Performance**: Fonts are loaded with `display: swap` for optimal performance

## Examples

### Landing Page Hero
```tsx
<Heading 
  fontSize="6xl" 
  fontWeight="800"
  fontFamily="heading" // Plus Jakarta Sans
>
  Order Food & Groceries
</Heading>
```

### Product Description
```tsx
<Text 
  fontSize="md" 
  fontWeight="400"
  fontFamily="body" // Inter
>
  Fresh ingredients delivered to your doorstep
</Text>
```

### Order Number
```tsx
<Text 
  fontSize="lg" 
  fontWeight="600"
  fontFamily="mono" // JetBrains Mono
>
  #ORD-2024-001234
</Text>
```
