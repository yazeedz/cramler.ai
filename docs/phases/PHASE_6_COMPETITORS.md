# Phase 6: Competitor Tracking

## Overview

Implement competitor management and comparison analytics.

**Priority:** Medium
**Dependencies:** Phase 4 (Visibility Engine), Phase 5 (Reports)

---

## Checklist

### Competitors Page

- [ ] Create `/competitors` route
- [ ] Organization-level share of voice
- [ ] Competitors grouped by brand
- [ ] Competitor cards with stats
- [ ] Add competitor modal

### Competitor Comparison View

- [ ] Head-to-head comparison
- [ ] Platform-by-platform breakdown
- [ ] Strengths/weaknesses analysis
- [ ] Product-level matchups
- [ ] Sample comparison responses

### Backend Updates

- [ ] Track competitor mentions in visibility queries
- [ ] Calculate share of voice
- [ ] Generate comparison insights

---

## Implementation Steps

### Step 1: Create Competitors Page

```tsx
// app/(protected)/competitors/page.tsx

export default async function CompetitorsPage() {
  const orgId = await getCurrentOrgId();
  const data = await getCompetitorData(orgId);

  return (
    <div>
      <PageHeader title="Competitor Tracking">
        <Button onClick={() => setShowAddModal(true)}>+ Add Competitor</Button>
      </PageHeader>

      <ShareOfVoiceOverview data={data.shareOfVoice} />

      {data.brands.map(brand => (
        <BrandCompetitorsSection
          key={brand.id}
          brand={brand}
          competitors={brand.competitors}
        />
      ))}

      <AddCompetitorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        brands={data.brands}
      />
    </div>
  );
}
```

### Step 2: Competitor Card Component

```tsx
interface CompetitorCardProps {
  competitor: BrandCompetitor;
  yourShareOfVoice: number;
  theirShareOfVoice: number;
  headToHeadWinRate: number;
}

export function CompetitorCard({
  competitor,
  yourShareOfVoice,
  theirShareOfVoice,
  headToHeadWinRate,
}: CompetitorCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{competitor.competitor_name}</CardTitle>
          <Badge>{competitor.competitor_type}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Share of Voice</p>
            <p>{theirShareOfVoice}% (vs your {yourShareOfVoice}%)</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Head-to-Head</p>
            <p>You win {headToHeadWinRate}% of comparisons</p>
          </div>

          <ShareOfVoiceBar
            you={yourShareOfVoice}
            them={theirShareOfVoice}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" onClick={() => viewComparison(competitor)}>
          View Comparison
        </Button>
        <Button variant="ghost" onClick={() => removeCompetitor(competitor)}>
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Step 3: Comparison View

```tsx
// app/(protected)/competitors/[id]/compare/page.tsx

export default async function CompareCompetitorPage({ params }) {
  const comparison = await getCompetitorComparison(params.id);

  return (
    <div>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbItem href="/competitors">Competitors</BreadcrumbItem>
          <BreadcrumbItem>{comparison.brandName}</BreadcrumbItem>
          <BreadcrumbItem>vs {comparison.competitorName}</BreadcrumbItem>
        </Breadcrumb>
      </PageHeader>

      <OverallComparison
        yourBrand={comparison.yourBrand}
        competitor={comparison.competitor}
        winRate={comparison.winRate}
      />

      <PlatformByPlatformTable data={comparison.platforms} />

      <StrengthsWeaknesses
        yourStrengths={comparison.yourStrengths}
        theirStrengths={comparison.theirStrengths}
      />

      <ProductMatchups matchups={comparison.productMatchups} />

      <SampleComparisonResponses responses={comparison.samples} />
    </div>
  );
}
```

### Step 4: Add Competitor Modal

```tsx
function AddCompetitorModal({ open, onClose, brands }) {
  const [level, setLevel] = useState<'brand' | 'product'>('brand');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  async function handleSubmit(data) {
    if (level === 'brand') {
      await supabase.from('brand_competitors').insert({
        brand_id: selectedBrand.id,
        competitor_name: data.name,
        competitor_type: data.type,
        notes: data.notes,
      });
    } else {
      await supabase.from('product_competitors').insert({
        product_id: selectedProduct.id,
        competitor_product: data.name,
        competitor_brand: data.brand,
        notes: data.notes,
      });
    }

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <RadioGroup value={level} onValueChange={setLevel}>
            <RadioGroupItem value="brand" label="Brand Level" />
            <RadioGroupItem value="product" label="Product Level" />
          </RadioGroup>

          <Select
            label="Your Brand"
            options={brands}
            value={selectedBrand}
            onChange={setSelectedBrand}
          />

          {level === 'product' && (
            <Select
              label="Your Product"
              options={selectedBrand?.products || []}
              value={selectedProduct}
              onChange={setSelectedProduct}
            />
          )}

          <Input
            label="Competitor Name"
            placeholder={level === 'brand' ? 'e.g., Chanel' : 'e.g., Bleu de Chanel'}
          />

          <Select
            label="Competitor Type"
            options={[
              { value: 'direct', label: 'Direct' },
              { value: 'indirect', label: 'Indirect' },
              { value: 'aspirational', label: 'Aspirational' },
            ]}
          />

          <Textarea label="Notes (optional)" />

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Competitor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Backend: Competitor Analysis

### Update Visibility Agent

```python
# In visibility_crew.py

def analyze_competitors_in_response(response: str, product: str, competitors: list) -> dict:
    """Analyze which competitors are mentioned and in what context."""

    mentioned = []
    for competitor in competitors:
        if competitor.lower() in response.lower():
            mentioned.append(competitor)

    # Determine winner if it's a comparison
    winner = determine_comparison_winner(response, product, mentioned)

    return {
        "competitors_mentioned": mentioned,
        "is_comparison": len(mentioned) > 0,
        "winner": winner,
    }
```

### Calculate Share of Voice

```typescript
async function calculateShareOfVoice(
  brandId: string,
  competitorNames: string[],
  period: DateRange
): Promise<Record<string, number>> {
  // Get all queries in period
  const queries = await supabase
    .from('visibility_queries')
    .select('response_text, competitors_mentioned')
    .eq('brand_id', brandId)
    .gte('queried_at', period.start)
    .lte('queried_at', period.end);

  // Count mentions for each brand
  const mentions: Record<string, number> = { [brandName]: 0 };
  competitorNames.forEach(name => mentions[name] = 0);

  for (const query of queries) {
    if (query.product_mentioned) mentions[brandName]++;
    for (const competitor of query.competitors_mentioned || []) {
      if (mentions[competitor] !== undefined) {
        mentions[competitor]++;
      }
    }
  }

  // Convert to percentages
  const total = Object.values(mentions).reduce((a, b) => a + b, 0);
  const shareOfVoice: Record<string, number> = {};

  for (const [name, count] of Object.entries(mentions)) {
    shareOfVoice[name] = total > 0 ? (count / total) * 100 : 0;
  }

  return shareOfVoice;
}
```

### Calculate Head-to-Head Win Rate

```typescript
async function calculateHeadToHead(
  brandId: string,
  competitorName: string,
  period: DateRange
): Promise<{ wins: number; losses: number; winRate: number }> {
  // Get comparison queries
  const queries = await supabase
    .from('visibility_queries')
    .select('*')
    .eq('brand_id', brandId)
    .contains('competitors_mentioned', [competitorName])
    .eq('query_category', 'comparison')
    .gte('queried_at', period.start)
    .lte('queried_at', period.end);

  let wins = 0;
  let losses = 0;

  for (const query of queries) {
    if (query.mention_position === 1) {
      wins++;
    } else if (query.product_mentioned) {
      losses++;
    }
  }

  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) * 100 : 50;

  return { wins, losses, winRate };
}
```

---

## Testing

### Add Competitor

1. Can add brand-level competitor
2. Can add product-level competitor
3. Duplicate prevention works
4. Remove works

### Share of Voice

1. Calculations are accurate
2. Updates with new data
3. Handles zero mentions

### Comparison View

1. Loads correct data
2. Platform breakdown accurate
3. Product matchups correct

---

## Next Phase

After completing Phase 6, proceed to [Phase 7: Recommendations & Insights](PHASE_7_INSIGHTS.md).

---

## See Also

- [Competitors Page Design](../frontend/pages/COMPETITORS.md)
- [Database Tables](../database/TABLES.md)
