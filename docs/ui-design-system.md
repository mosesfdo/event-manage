# UI Design System

## Design Principles
- **Consistency**: Uniform spacing, typography, and color usage
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Mobile-first approach
- **Performance**: Minimal layout shifts, fast loading

## Color System

### Primary Colors
```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;  /* Main brand color */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-900: #1e3a8a;
```

### Semantic Colors
```css
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;
```

## Typography Scale

### Font Family
- **Primary**: Inter, system-ui, sans-serif
- **Monospace**: 'Fira Code', Consolas, monospace

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Component Specifications

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  transform: none;
}
```

### Form Inputs
```css
.input-field {
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: var(--error);
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Layout Grid
- **Container**: max-width: 1200px, centered
- **Grid**: 12-column system
- **Breakpoints**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

## Accessibility Guidelines

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### Focus Management
- Visible focus indicators
- Logical tab order
- Skip links for navigation

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and descriptions
- Alt text for images

## Animation Guidelines
- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: ease-out for entrances, ease-in for exits
- **Respect**: prefers-reduced-motion setting

## Component States

### Loading States
- Skeleton loaders for content
- Spinner for actions
- Progress bars for uploads

### Empty States
- Meaningful illustrations
- Clear call-to-action
- Helpful guidance text

### Error States
- Clear error messages
- Recovery suggestions
- Retry mechanisms