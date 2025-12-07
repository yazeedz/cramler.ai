# Phase 3: Product Management Refactor

## Overview

Update product pages to work with brands and show visibility data.

**Priority:** High
**Dependencies:** Phase 1 (Database), Phase 2 (Organizations & Brands)

---

## Checklist

### Product List Page

- [ ] Update `/products` to show all org products
- [ ] Add brand filter
- [ ] Add visibility score column
- [ ] Add category rank column
- [ ] Update product card design
- [ ] Pagination

### Product Detail Page

- [ ] Update `/products/[id]` layout
- [ ] Add visibility tab (new)
- [ ] Platform breakdown cards
- [ ] Competitive position section
- [ ] AI sentiment analysis
- [ ] Top triggering queries
- [ ] Update details tab
- [ ] Add competitors tab
- [ ] Add reports tab

### Add Product Flow

- [ ] Update add product modal
- [ ] Require brand selection
- [ ] Auto-generate slug
- [ ] Trigger n8n workflow

### Update CrewAI Integration

- [ ] Pass brand_id to workflow
- [ ] Update Edge Function for new schema
- [ ] Handle new product fields

---

## Implementation Steps

### Step 1: Update Product List

```tsx
// app/(protected)/products/page.tsx

export default async function ProductsPage() {
  // Fetch all products for user's brands
  const products = await getOrganizationProducts(orgId);

  return (
    <div>
      <PageHeader title="Products" />
      <ProductFilters brands={brands} />
      <ProductGrid products={products} />
      <Pagination />
    </div>
  );
}
```

### Step 2: Update Product Detail

```tsx
// app/(protected)/products/[id]/page.tsx

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  const visibilityData = await getProductVisibility(params.id);

  return (
    <div>
      <ProductHeader product={product} />
      <Tabs defaultValue="visibility">
        <TabsList>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="visibility">
          <VisibilityScore data={visibilityData} />
          <PlatformBreakdown data={visibilityData} />
          <CompetitivePosition data={visibilityData} />
          <SentimentAnalysis data={visibilityData} />
          <TopQueries data={visibilityData} />
        </TabsContent>

        {/* Other tabs */}
      </Tabs>
    </div>
  );
}
```

### Step 3: New Components

#### VisibilityScore

```tsx
interface VisibilityScoreProps {
  score: number;
  rank: number;
  category: string;
  trend: number;
  recommendationRate: number;
  firstChoiceRate: number;
}

export function VisibilityScore(props: VisibilityScoreProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <ScoreGauge score={props.score} />
        <div>
          <p>#{props.rank} in {props.category}</p>
          <p>Trend: {props.trend > 0 ? '+' : ''}{props.trend}%</p>
        </div>
      </div>
    </Card>
  );
}
```

#### PlatformCard

```tsx
interface PlatformCardProps {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot';
  score: number;
  mentions: number;
  change: number;
}

export function PlatformCard(props: PlatformCardProps) {
  const icon = platformIcons[props.platform];

  return (
    <Card>
      <div className="flex flex-col items-center">
        {icon}
        <p className="text-2xl font-bold">{props.score}</p>
        <p className="text-sm text-muted-foreground">
          {props.change > 0 ? '↑' : props.change < 0 ? '↓' : '—'} {Math.abs(props.change)}
        </p>
        <p className="text-xs">{props.mentions} mentions</p>
      </div>
    </Card>
  );
}
```

### Step 4: Update Add Product Modal

```tsx
function AddProductModal({ brands }) {
  const [selectedBrand, setSelectedBrand] = useState(null);

  async function handleSubmit(data) {
    // Create product with brand_id
    const product = await createProduct({
      brand_id: selectedBrand.id,
      name: data.name,
      slug: generateSlug(data.name),
      status: 'pending',
    });

    // Trigger n8n workflow
    await triggerProductResearch(product);

    // Navigate to product
    router.push(`/products/${product.id}`);
  }

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Select
            label="Brand"
            options={brands}
            value={selectedBrand}
            onChange={setSelectedBrand}
          />

          <Input
            label="Product Name"
            placeholder="e.g., Sauvage Eau de Parfum"
          />

          <Button type="submit">Add Product</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 5: Update n8n Workflow

Update workflow to handle brand_id:

```json
{
  "nodes": [
    {
      "name": "CrewAI Product Research",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://host.docker.internal:8000/research/simple",
        "method": "POST",
        "body": {
          "product_id": "={{ $json.product_id }}",
          "product_name": "={{ $json.product_name }}",
          "brand_id": "={{ $json.brand_id }}",
          "user_id": "={{ $json.user_id }}"
        }
      }
    }
  ]
}
```

---

## API Functions

### getOrganizationProducts

```typescript
async function getOrganizationProducts(
  orgId: string,
  filters?: {
    brandId?: string;
    status?: string;
    search?: string;
  }
) {
  const query = supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name),
      product_visibility_reports(
        overall_visibility_score,
        category_rank,
        visibility_change
      )
    `)
    .in('brand_id', await getUserBrandIds(orgId));

  // Apply filters...

  return query;
}
```

### getProductVisibility

```typescript
async function getProductVisibility(productId: string) {
  const { data } = await supabase
    .from('product_visibility_reports')
    .select('*')
    .eq('product_id', productId)
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  return data;
}
```

---

## Empty States

### No Products

```tsx
<EmptyState
  icon={<Package />}
  title="No products yet"
  description="Add your first product to start tracking AI visibility"
  action={{
    label: "Add Product",
    onClick: () => setShowAddModal(true),
  }}
/>
```

### No Visibility Data

```tsx
<EmptyState
  icon={<BarChart />}
  title="Visibility data coming soon"
  description="We're analyzing AI platforms for this product. Check back in 24 hours."
/>
```

---

## Testing

### Product List

1. Shows all products from user's brands
2. Filters work correctly
3. Clicking product navigates to detail
4. Pagination works

### Product Detail

1. All tabs load correctly
2. Visibility data displays (if available)
3. Empty state shows when no data
4. Edit product works

### Add Product

1. Brand selection required
2. Product created with brand_id
3. n8n workflow triggered
4. Redirects to product page
5. Real-time status updates work

---

## Next Phase

After completing Phase 3, proceed to [Phase 4: Visibility Monitoring Engine](PHASE_4_VISIBILITY.md).

---

## See Also

- [Products Page Design](../frontend/pages/PRODUCTS.md)
- [Components](../frontend/COMPONENTS.md)
