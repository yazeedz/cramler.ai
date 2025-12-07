# Phase 2: Organization & Brand Management

## Overview

Implement organization setup, onboarding flow, and brand management UI.

**Priority:** Critical
**Dependencies:** Phase 1 (Database)

---

## Checklist

### Organization Context

- [ ] Create organization context provider
- [ ] Add organization to user session
- [ ] Handle org switching (multi-org users)
- [ ] Store current org in local storage

### Onboarding Flow

- [ ] Create `/onboarding` route
- [ ] Step 1: Organization form
- [ ] Step 2: Brand form
- [ ] Step 3: Products form
- [ ] Progress indicator component
- [ ] Redirect logic in middleware

### Dashboard Page

- [ ] Create `/dashboard` route
- [ ] Stats cards (score, brands, products)
- [ ] Platform visibility chart
- [ ] Brand performance table
- [ ] Recent alerts section

### Brand Pages

- [ ] Create `/brands` route (list)
- [ ] Brand card component
- [ ] Search and filter
- [ ] Create `/brands/[id]` route (detail)
- [ ] Brand header with logo
- [ ] Tabs: Overview, Products, Reports, Competitors
- [ ] Add brand modal
- [ ] Edit brand modal

### Navigation Updates

- [ ] Add new menu items to sidebar
- [ ] Organization switcher (header)
- [ ] Update breadcrumbs
- [ ] Active state for current page

---

## Implementation Steps

### Step 1: Organization Context

```typescript
// contexts/OrganizationContext.tsx

interface OrganizationContextType {
  organization: Organization | null;
  brands: Brand[];
  isLoading: boolean;
  switchOrganization: (orgId: string) => void;
}

export const OrganizationProvider = ({ children }) => {
  // Fetch user's organizations
  // Set current org from localStorage or first org
  // Provide context to children
};
```

### Step 2: Update Middleware

```typescript
// middleware.ts

// Add check for organization
if (!userHasOrganization) {
  return NextResponse.redirect('/onboarding');
}
```

### Step 3: Create Onboarding Pages

```
app/
└── (auth)/
    └── onboarding/
        ├── layout.tsx      # No sidebar layout
        ├── page.tsx        # Step 1: Organization
        ├── brand/
        │   └── page.tsx    # Step 2: Brand
        └── products/
            └── page.tsx    # Step 3: Products
```

### Step 4: Create Dashboard Page

```
app/
└── (protected)/
    └── dashboard/
        └── page.tsx
```

Components:
- StatsCard
- PlatformVisibilityChart
- BrandPerformanceTable
- AlertsList

### Step 5: Create Brand Pages

```
app/
└── (protected)/
    └── brands/
        ├── page.tsx        # Brand list
        └── [id]/
            └── page.tsx    # Brand detail
```

Components:
- BrandCard
- BrandHeader
- BrandTabs
- AddBrandModal
- EditBrandModal

### Step 6: Update Navigation

```typescript
// Update sidebar navigation items
const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Brands", href: "/brands", icon: Tag },
  { title: "Products", href: "/products", icon: Package },
  // ... etc
];
```

---

## New Components

### OrganizationSwitcher

```tsx
<OrganizationSwitcher
  organizations={userOrgs}
  currentOrgId={currentOrg.id}
  onSwitch={handleSwitch}
/>
```

### BrandCard

```tsx
<BrandCard
  brand={brand}
  score={85}
  productCount={24}
  onView={() => router.push(`/brands/${brand.id}`)}
/>
```

### StatsCard

```tsx
<StatsCard
  label="Overall Score"
  value="72/100"
  change={+5}
  icon={<TrendingUp />}
/>
```

### OnboardingStep

```tsx
<OnboardingStep
  step={1}
  totalSteps={3}
  title="Organization Details"
>
  {/* Form content */}
</OnboardingStep>
```

---

## API Functions

### createOrganization

```typescript
async function createOrganization(data: {
  name: string;
  industry: string;
  website?: string;
}) {
  // Insert organization
  // Add user as owner
  // Return organization
}
```

### createBrand

```typescript
async function createBrand(data: {
  organization_id: string;
  name: string;
  category_id?: string;
  market_position?: string;
  website?: string;
}) {
  // Insert brand
  // Return brand
}
```

### getOrganizationDashboard

```typescript
async function getOrganizationDashboard(orgId: string) {
  // Fetch org with brands
  // Fetch aggregate visibility scores
  // Fetch recent alerts
  // Return dashboard data
}
```

---

## Testing

### Onboarding Flow

1. New user logs in → redirected to /onboarding
2. Fill org form → proceed to brand
3. Fill brand form → proceed to products
4. Add products → redirected to dashboard
5. All data created correctly

### Dashboard

1. Shows correct stats
2. Shows all user's brands
3. Clicking brand navigates to detail

### Brand Management

1. Add brand works
2. Edit brand works
3. Brand detail shows correct tabs
4. Products tab shows brand's products

---

## Next Phase

After completing Phase 2, proceed to [Phase 3: Product Management Refactor](PHASE_3_PRODUCTS.md).

---

## See Also

- [Onboarding Page Design](../frontend/pages/ONBOARDING.md)
- [Dashboard Page Design](../frontend/pages/DASHBOARD.md)
- [Brands Page Design](../frontend/pages/BRANDS.md)
