# Login Page Responsiveness Fix

## Steps
- [x] Plan approved
- [x] **Step 1**: Update `login.html` — add `viewport-fit=cover` meta tag for safe-area support + theme-color
- [x] **Step 2**: Update `css/login.css` — replaced basic responsive section with comprehensive breakpoints:
  - [x] ≤1024px — adjust container, left/right proportions
  - [x] ≤900px — enhanced existing column layout
  - [x] ≤768px — tablet optimizations
  - [x] ≤640px — small tablet/large phone
  - [x] ≤480px — phone layout
  - [x] ≤360px — small phone
  - [x] Landscape orientation — scrollable, compact
  - [x] Safe-area / notch support
  - [x] Dark mode support
  - [x] Reduced motion preference
  - [x] High DPI / Retina optimization
- [x] **Step 3**: Fixed Safari `backdrop-filter` compatibility warning

## Notes
- Speech bubble scales down gradually, hidden on ≤360px
- Mascot shown with reduced height on all mobile sizes
- Touch-friendly input sizes retained (16px on iOS)
- All particles hidden at ≤480px for performance
- Toast notification container adapted for small screens
- `100dvh` units used alongside `100vh` for mobile browser consistency

