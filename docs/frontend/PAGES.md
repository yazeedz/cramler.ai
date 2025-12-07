# Frontend Pages Overview

## User Context Model

Each user views the app scoped to:
- **One organization** at a time
- **One brand** within that organization

All pages show data for the currently selected brand.

---

## Page Structure

```
app/
├── (auth)/                      # Public auth routes
│   ├── login/page.tsx
│   └── auth/callback/route.ts
│
├── (protected)/                 # Protected routes (with sidebar)
│   ├── layout.tsx               # Sidebar layout + context provider
│   │
│   ├── onboarding/              # NEW: Setup wizard
│   │   ├── page.tsx             # Step 1: Organization
│   │   ├── brand/page.tsx       # Step 2: First brand
│   │   └── products/page.tsx    # Step 3: Add products
│   │
│   ├── overview/page.tsx        # NEW: Brand overview dashboard
│   │
│   ├── insights/page.tsx        # NEW: AI insights & recommendations
│   │
│   ├── products/                # UPDATED: Products for current brand
│   │   ├── page.tsx             # Product list
│   │   └── [id]/page.tsx        # Product detail (with visibility)
│   │
│   ├── settings/                # UPDATED: Settings
│   │   ├── page.tsx             # General settings
│   │   ├── brand/page.tsx       # NEW: Brand settings
│   │   └── team/page.tsx        # NEW: Team management
│   │
│   └── new/page.tsx             # EXISTING: Quick add product
│
└── legal/                       # Public legal pages
    ├── terms/page.tsx
    ├── privacy/page.tsx
    └── usage/page.tsx
```

---

## Page Summary

| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Login | `/login` | Existing | Google OAuth login |
| Onboarding | `/onboarding` | New | 3-step org/brand setup wizard |
| Overview | `/overview` | New | Brand visibility dashboard |
| Insights | `/insights` | New | AI recommendations & competitor insights |
| Products | `/products` | Updated | Product list for current brand |
| Product Detail | `/products/[id]` | Updated | Product with visibility data |
| Settings | `/settings` | Updated | User + brand settings |
| Quick Add | `/new` | Existing | Quick add product |

---

## Page Categories

### Authentication (Public)
- Login page with Google OAuth
- Callback handler

### Onboarding (Protected, No Sidebar)
- Organization setup
- First brand creation
- Initial products

### Main App (Protected, With Sidebar)
- Overview (brand dashboard)
- Insights (recommendations + competitors)
- Products (product management)
- Settings

---

## Navigation Structure

```
Sidebar
├── Overview           /overview
├── Insights           /insights
├── Products           /products
│   └── [Product]      /products/[id]
└── Settings           /settings
    ├── General        /settings
    ├── Brand          /settings/brand
    └── Team           /settings/team
```

---

## Data Scoping

All pages fetch data based on the current user context:

```typescript
// In layout or provider
const { organizationId, brandId } = useUserContext();

// Overview page
const brandStats = await getBrandVisibility(brandId);

// Insights page
const insights = await getInsights(brandId);
const competitors = await getCompetitors(brandId);

// Products page
const products = await getProducts(brandId);
```

---

## See Also

- [Individual Page Designs](pages/)
- [Components](COMPONENTS.md)
- [Navigation](NAVIGATION.md)
