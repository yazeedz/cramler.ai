# Products Page

## Route

`/products`

## Purpose

The Products page shows all products for the **currently selected brand**. Users can view, add, and manage products with their AI visibility data.

---

## Product List Page

**Route:** `/products`

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Products                                                        + Add Product     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ Search products...                          Status: All ▼                    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                               │   │
│  │ ┌────┐                                                                       │   │
│  │ │IMG │  Sauvage Eau de Parfum                                                │   │
│  │ └────┘  Men's Fragrance • $150                                               │   │
│  │         Score: 92/100  #1 in category   Ready                                │   │
│  │                                                                               │   │
│  │ ┌────┐                                                                       │   │
│  │ │IMG │  Miss Dior Eau de Parfum                                              │   │
│  │ └────┘  Women's Fragrance • $135                                             │   │
│  │         Score: 88/100  #3 in category   Ready                                │   │
│  │                                                                               │   │
│  │ ┌────┐                                                                       │   │
│  │ │IMG │  J'adore                                                              │   │
│  │ └────┘  Women's Fragrance • $130                                             │   │
│  │         Score: 85/100  #4 in category   Ready                                │   │
│  │                                                                               │   │
│  │ ┌────┐                                                                       │   │
│  │ │IMG │  Dior Homme                                                           │   │
│  │ └────┘  Men's Fragrance • $120                                               │   │
│  │         Score: — Pending                 Researching                          │   │
│  │                                                                               │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  Showing 1-10 of 12 products                                    ← 1 2 →            │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Filters

| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Search by name |
| Status | Select | All / Ready / Pending / Researching / Error |

Note: No brand filter needed since products are already scoped to current brand.

### Product Card Data

```typescript
interface ProductListItem {
  id: string;
  name: string;
  image_url?: string;
  product_type?: string;
  price?: string;
  status: 'pending' | 'researching' | 'ready' | 'error';
  visibilityScore?: number;
  categoryRank?: number;
}
```

---

## Product Detail Page

**Route:** `/products/[id]`

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  ← Products                                                                          │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │  ┌────────┐                                                                   │   │
│  │  │        │   Sauvage Eau de Parfum                           Edit           │   │
│  │  │  IMG   │   Men's Fragrance • $150 • 100ml                                 │   │
│  │  │        │                                                                   │   │
│  │  └────────┘                                                                   │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌────────────┬────────────┬────────────┬────────────┐                              │
│  │ Visibility │ Details    │ Competitors│ History    │                              │
│  └────────────┴────────────┴────────────┴────────────┘                              │
│                                                                                      │
│  [TAB CONTENT - See below]                                                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Tab 1: Visibility (Default)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   AI Visibility Score                                                         │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │      92/100           #1 in Men's Luxury Fragrances                  │   │
│   │                                                                       │   │
│   │  Trend: +15% vs last week                                            │   │
│   │  Recommended: 78% of relevant queries                                 │   │
│   │  First Choice: 52% of recommendations                                 │   │
│   │                                                                       │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   Platform Breakdown                                                          │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                  │   │
│   │  │   ChatGPT    │ │    Claude    │ │  Perplexity  │                  │   │
│   │  │     95       │ │     90       │ │     92       │                  │   │
│   │  │   +8         │ │   +15        │ │   +5         │                  │   │
│   │  └──────────────┘ └──────────────┘ └──────────────┘                  │   │
│   │                                                                       │   │
│   │  ┌──────────────┐ ┌──────────────┐                                   │   │
│   │  │    Gemini    │ │   Copilot    │                                   │   │
│   │  │     88       │ │     85       │                                   │   │
│   │  │   -2         │ │   —          │                                   │   │
│   │  └──────────────┘ └──────────────┘                                   │   │
│   │                                                                       │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   Competitive Position                                                        │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │  vs Bleu de Chanel:     Wins 62% of comparisons                      │   │
│   │  vs Y by YSL:           Wins 71% of comparisons                      │   │
│   │  vs Acqua di Gio:       Wins 58% of comparisons                      │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   What AI Says About This Product                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  Strengths                         Weaknesses                        │   │
│   │  • Long-lasting scent              • Premium price point             │   │
│   │  • Versatile for occasions         • Some find it too strong         │   │
│   │  • Modern masculine appeal         • Common/overused                 │   │
│   │                                                                       │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   Top Queries Triggering Mentions                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │  "best men's cologne 2024"                    234 mentions           │   │
│   │  "long lasting men's fragrance"               189 mentions           │   │
│   │  "gift for boyfriend cologne"                 156 mentions           │   │
│   │  "sauvage vs bleu de chanel"                  145 mentions           │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Tab 2: Details

Shows product information:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   Description                                                                 │
│   A bold and magnetic fragrance for men, featuring notes of                  │
│   bergamot, pepper, and ambroxan...                                          │
│                                                                               │
│   What It Does                                                                │
│   Creates a fresh, powerful, and long-lasting scent suitable                 │
│   for day or evening wear...                                                 │
│                                                                               │
│   Key Differentiator                                                          │
│   The unique use of ambroxan gives Sauvage its signature                     │
│   freshness and longevity...                                                 │
│                                                                               │
│   Ingredients                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │  Bergamot  |  Pepper  |  Lavender  |  Ambroxan  |  Cedar            │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   Product Claims                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │  Long-lasting  |  Fresh  |  Masculine  |  Versatile                 │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   Metadata                                                                    │
│   Category: Fragrance                                                         │
│   Sub-category: Men's Eau de Parfum                                          │
│   Target Audience: Men 25-45, luxury consumers                               │
│   Price: $150 (100ml)                                                        │
│   Added: December 1, 2024                                                    │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Tab 3: Competitors

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   Product Competitors                                   + Add Competitor     │
│                                                                               │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │                                                                       │   │
│   │  Bleu de Chanel                                          Chanel      │   │
│   │                                                                       │   │
│   │  Head-to-head: You win 62% of comparisons                            │   │
│   │  AI mentions you together: 145 times                                 │   │
│   │                                                                       │   │
│   │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│   │  │ Sauvage          ██████████████████████████  62%   (You)        │ │   │
│   │  │ Bleu de Chanel   █████████████████  38%                         │ │   │
│   │  └─────────────────────────────────────────────────────────────────┘ │   │
│   │                                                                       │   │
│   │  [View Responses]  [Remove]                                          │   │
│   │                                                                       │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Tab 4: History

Historical visibility reports:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│   Visibility History                                          Export         │
│                                                                               │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │  [Chart: Visibility score over time with trend line]                │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │ Date       │ Score │ ChatGPT │ Claude │ Perplexity │ Rank │ Change  │   │
│   ├────────────┼───────┼─────────┼────────┼────────────┼──────┼─────────┤   │
│   │ Dec 3      │ 92    │ 95      │ 90     │ 92         │ #1   │ +3      │   │
│   │ Dec 2      │ 89    │ 92      │ 88     │ 89         │ #1   │ +2      │   │
│   │ Dec 1      │ 87    │ 90      │ 85     │ 87         │ #2   │ +5      │   │
│   │ Nov 30     │ 82    │ 85      │ 80     │ 82         │ #2   │ —       │   │
│   └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Add Product Modal

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                        X     │
│   Add New Product                                                            │
│                                                                               │
│   Adding to: Dior                                                            │
│                                                                               │
│   Product Name *                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │ e.g., Sauvage Eau de Parfum                                         │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│   Our AI will automatically research this product and populate              │
│   details like ingredients, claims, and pricing.                            │
│                                                                               │
│   ┌────────────────┐                              ┌────────────────────┐     │
│   │    Cancel      │                              │    Add Product     │     │
│   └────────────────┘                              └────────────────────┘     │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

Note: Brand selection is not needed since products are added to the current brand context.

---

## Status States

| Status | Badge Color | Description |
|--------|-------------|-------------|
| `pending` | Yellow | Waiting for AI research |
| `researching` | Blue | AI is currently researching |
| `ready` | Green | Research complete, data available |
| `error` | Red | Research failed |

---

## Data Fetching

```typescript
// app/(protected)/products/page.tsx

export default async function ProductsPage() {
  const { brandId } = await getUserContext();

  const products = await getProductsForBrand(brandId);

  return (
    <div className="space-y-6">
      <PageHeader title="Products">
        <Button onClick={() => setShowAddModal(true)}>
          + Add Product
        </Button>
      </PageHeader>

      <ProductFilters />
      <ProductList products={products} />
    </div>
  );
}
```

## API Queries

```typescript
// Get products for current brand with visibility data
async function getProductsForBrand(brandId: string) {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_visibility_reports(
        overall_visibility_score,
        category_rank,
        visibility_change
      )
    `)
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  return data;
}

// Get single product with all details
async function getProduct(productId: string) {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name),
      product_competitors(*),
      product_visibility_reports(*)
    `)
    .eq('id', productId)
    .single();

  return data;
}
```

---

## See Also

- [Overview Page](OVERVIEW.md)
- [Insights Page](INSIGHTS.md)
- [Components](../COMPONENTS.md)
