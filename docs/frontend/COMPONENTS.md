# Frontend Components

## Component Categories

1. **Layout Components** - Page structure, navigation
2. **Data Display** - Tables, cards, charts
3. **Form Components** - Inputs, selects, buttons
4. **Feedback** - Alerts, toasts, modals
5. **Custom Components** - Domain-specific

---

## Existing Components (shadcn/ui)

The project already has these shadcn/ui components installed:

### Layout
- `Sidebar` - Main navigation sidebar
- `Card` - Content containers
- `Tabs` - Tabbed content
- `Accordion` - Collapsible sections
- `Drawer` - Slide-out panels
- `Dialog` - Modal dialogs
- `Sheet` - Side panels

### Data Display
- `Table` - Data tables
- `Badge` - Status badges
- `Avatar` - User avatars
- `Separator` - Visual dividers

### Form
- `Button` - Action buttons
- `Input` - Text inputs
- `Select` - Dropdown selects
- `Checkbox` - Checkboxes
- `RadioGroup` - Radio buttons
- `Switch` - Toggle switches
- `Label` - Form labels
- `Form` - Form wrapper (react-hook-form)

### Feedback
- `Alert` - Alert messages
- `Toast` (Sonner) - Notifications
- `Progress` - Progress bars
- `Skeleton` - Loading placeholders

### Navigation
- `Breadcrumb` - Page breadcrumbs
- `DropdownMenu` - Dropdown menus
- `NavigationMenu` - Navigation menus
- `Command` - Command palette

---

## New Components Needed

### 1. OrganizationSwitcher

Switch between organizations (for multi-org users).

```tsx
interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrgId: string;
  onSwitch: (orgId: string) => void;
}

// Usage
<OrganizationSwitcher
  organizations={userOrganizations}
  currentOrgId={currentOrg.id}
  onSwitch={handleOrgSwitch}
/>
```

### 2. VisibilityScore

Display a visibility score with gauge and trend.

```tsx
interface VisibilityScoreProps {
  score: number;           // 0-100
  change?: number;         // +/- change
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
}

// Usage
<VisibilityScore score={85} change={+8} size="lg" showTrend />
```

Visualization:
```
┌─────────────────────────────────────┐
│         ┌───────────────┐           │
│         │               │           │
│         │      85       │  ↑ +8%    │
│         │               │           │
│         └───────────────┘           │
│                                     │
│  ████████████████████░░░░░          │
└─────────────────────────────────────┘
```

### 3. PlatformScoreCard

Show visibility score for a specific AI platform.

```tsx
interface PlatformScoreCardProps {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot';
  score: number;
  mentions: number;
  change?: number;
}

// Usage
<PlatformScoreCard
  platform="chatgpt"
  score={92}
  mentions={234}
  change={+5}
/>
```

Visualization:
```
┌───────────────────────┐
│   ChatGPT             │
│                       │
│      92               │
│     ↑ +5              │
│                       │
│   234 mentions        │
└───────────────────────┘
```

### 4. BrandCard

Display a brand in the brand list.

```tsx
interface BrandCardProps {
  brand: Brand;
  score?: number;
  productCount: number;
  onView: () => void;
}

// Usage
<BrandCard
  brand={diorBrand}
  score={85}
  productCount={24}
  onView={() => router.push(`/brands/${brand.id}`)}
/>
```

Visualization:
```
┌────────────────────────────────────────────────────────────────┐
│  [LOGO]   Dior Beauty                                          │
│           Perfumes & Cosmetics • Luxury • 24 products          │
│                                                                 │
│           Score: 85/100  ↑ +8%     3 competitors tracked       │
│                                                                 │
│           ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│           │ View Brand │ │ Products   │ │ Reports    │         │
│           └────────────┘ └────────────┘ └────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

### 5. ProductCard

Display a product in the product list.

```tsx
interface ProductCardProps {
  product: Product;
  brand: Brand;
  score?: number;
  rank?: number;
  onView: () => void;
}

// Usage
<ProductCard
  product={sauvageProduct}
  brand={diorBrand}
  score={92}
  rank={1}
  onView={() => router.push(`/products/${product.id}`)}
/>
```

### 6. CompetitorCard

Display a competitor with comparison stats.

```tsx
interface CompetitorCardProps {
  competitor: BrandCompetitor | ProductCompetitor;
  winRate?: number;
  shareOfVoice?: number;
  onViewDetail: () => void;
}
```

### 7. RecommendationCard

Display an AI-generated recommendation.

```tsx
interface RecommendationCardProps {
  recommendation: Recommendation;
  onStart: () => void;
  onDismiss: () => void;
  onViewDetail: () => void;
}

// Usage
<RecommendationCard
  recommendation={rec}
  onStart={() => updateStatus('in_progress')}
  onDismiss={() => updateStatus('dismissed')}
  onViewDetail={() => openDetail(rec.id)}
/>
```

### 8. TrendChart

Display visibility trends over time.

```tsx
interface TrendChartProps {
  data: { date: string; score: number }[];
  competitors?: { name: string; data: { date: string; score: number }[] }[];
  period: 'week' | 'month' | 'quarter';
}

// Usage
<TrendChart
  data={visibilityTrend}
  competitors={[
    { name: 'Chanel', data: chanelTrend },
    { name: 'YSL', data: yslTrend },
  ]}
  period="month"
/>
```

### 9. StatusBadge

Display product/brand status.

```tsx
interface StatusBadgeProps {
  status: 'pending' | 'researching' | 'ready' | 'error' | 'active' | 'inactive';
}

// Colors
// pending: yellow
// researching: blue
// ready: green
// error: red
// active: green
// inactive: gray
```

### 10. QueryCard

Display a visibility query and response.

```tsx
interface QueryCardProps {
  query: VisibilityQuery;
  showResponse?: boolean;
}

// Usage
<QueryCard query={queryData} showResponse />
```

---

## Form Components

### 1. BrandForm

Create/edit a brand.

```tsx
interface BrandFormProps {
  brand?: Brand;          // undefined for create
  categories: Category[];
  onSubmit: (data: BrandFormData) => void;
  onCancel: () => void;
}

interface BrandFormData {
  name: string;
  slug: string;
  category_id?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  market_position?: 'Luxury' | 'Premium' | 'Mass Market';
}
```

### 2. ProductForm

Create/edit a product.

```tsx
interface ProductFormProps {
  product?: Product;      // undefined for create
  brands: Brand[];
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  brand_id: string;
  sku?: string;
  product_url?: string;
  // ... other fields
}
```

### 3. CompetitorForm

Add a competitor.

```tsx
interface CompetitorFormProps {
  type: 'brand' | 'product';
  parentId: string;       // brand_id or product_id
  onSubmit: (data: CompetitorFormData) => void;
  onCancel: () => void;
}
```

### 4. OrganizationForm

Create/edit organization.

```tsx
interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: OrgFormData) => void;
  onCancel: () => void;
}
```

### 5. TeamMemberForm

Invite team members.

```tsx
interface TeamMemberFormProps {
  organizationId: string;
  onSubmit: (data: InviteData) => void;
  onCancel: () => void;
}

interface InviteData {
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
}
```

---

## Layout Components

### 1. PageHeader

Consistent page header with title and actions.

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

// Usage
<PageHeader
  title="Brands"
  description="Manage your brands and track their AI visibility"
  actions={<Button>+ Add Brand</Button>}
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Brands' },
  ]}
/>
```

### 2. StatsGrid

Grid of stat cards.

```tsx
interface StatsGridProps {
  stats: {
    label: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
  }[];
}

// Usage
<StatsGrid
  stats={[
    { label: 'Overall Score', value: '72/100', change: +5 },
    { label: 'Total Brands', value: 12 },
    { label: 'Total Products', value: 156 },
  ]}
/>
```

### 3. TabsPanel

Consistent tabbed content.

```tsx
interface TabsPanelProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
    badge?: number;
  }[];
  defaultTab?: string;
}
```

---

## Empty States

### EmptyState Component

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Usage
<EmptyState
  icon={<Package className="h-12 w-12" />}
  title="No products yet"
  description="Add your first product to start tracking AI visibility"
  action={{
    label: "Add Product",
    onClick: () => setShowAddModal(true),
  }}
/>
```

---

## Loading States

### LoadingSkeleton

```tsx
// Brand card skeleton
<Card>
  <Skeleton className="h-12 w-12 rounded" />
  <Skeleton className="h-4 w-48" />
  <Skeleton className="h-4 w-32" />
</Card>

// Table skeleton
<Table>
  {[...Array(5)].map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    </TableRow>
  ))}
</Table>
```

---

## See Also

- [All Pages](PAGES.md)
- [Navigation](NAVIGATION.md)
- [Page Designs](pages/)
