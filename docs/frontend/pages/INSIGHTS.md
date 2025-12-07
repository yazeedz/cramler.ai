# Insights Page

## Route

`/insights`

## Purpose

The Insights page combines AI-generated recommendations and competitor analysis into a single actionable view. It helps users understand what they should do to improve visibility and how they compare to competitors.

---

## Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Insights                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Tabs: [ Recommendations ]  [ Competitors ]  [ Sample Responses ]      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ══════════════════════════════════════════════════════════════════════════ │
│                         RECOMMENDATIONS TAB                                  │
│  ══════════════════════════════════════════════════════════════════════════ │
│                                                                              │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ │
│  │  High Priority       │ │  Medium Priority     │ │  Completed           │ │
│  │                      │ │                      │ │                      │ │
│  │         3            │ │         5            │ │         12           │ │
│  │     ───────          │ │     ───────          │ │     ───────          │ │
│  │   needs action       │ │   can improve        │ │   this month         │ │
│  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ │
│                                                                              │
│  Filter: [All Priorities ▼]  [All Products ▼]  [All Types ▼]                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  HIGH PRIORITY                                                          ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │ ● Improve Sauvage product description                              │ ││
│  │  │   Sauvage Eau de Parfum                                            │ ││
│  │  │                                                                     │ ││
│  │  │   AI platforms mention "lacking ingredient details". Adding        │ ││
│  │  │   key ingredient information could improve mentions by 15%.        │ ││
│  │  │                                                                     │ ││
│  │  │   Impact: High   Effort: Low                                       │ ││
│  │  │                                                                     │ ││
│  │  │   [Start]  [Dismiss]  [View Details]                               │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │ ● Update pricing information                                        │ ││
│  │  │   Multiple products                                                 │ ││
│  │  │                                                                     │ ││
│  │  │   AI assistants frequently mention "price not available" when      │ ││
│  │  │   recommending your products.                                       │ ││
│  │  │                                                                     │ ││
│  │  │   Impact: Medium   Effort: Low                                     │ ││
│  │  │                                                                     │ ││
│  │  │   [Start]  [Dismiss]  [View Details]                               │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  MEDIUM PRIORITY                                                        ││
│  │  ...                                                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ══════════════════════════════════════════════════════════════════════════ │
│                         COMPETITORS TAB                                      │
│  ══════════════════════════════════════════════════════════════════════════ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Share of Voice                                         + Add Competitor││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │                                                                     │ ││
│  │  │  Chanel     ████████████████████████████████████  35%  ↑ +2%      │ ││
│  │  │  Dior (You) █████████████████████████████         28%  ↓ -2%      │ ││
│  │  │  YSL        █████████████████████                 22%  — 0%       │ ││
│  │  │  Guerlain   ███████████████                       15%  ↓ -1%      │ ││
│  │  │                                                                     │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Head-to-Head Comparisons                                               ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │  Dior vs Chanel                                      [Compare →]   │ ││
│  │  │                                                                     │ ││
│  │  │  You win 42% of direct comparisons                                 │ ││
│  │  │                                                                     │ ││
│  │  │  Your strengths:        Their strengths:                           │ ││
│  │  │  • Modern appeal        • Heritage                                 │ ││
│  │  │  • Versatility          • Classic elegance                         │ ││
│  │  │  • Value                • Prestige                                 │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │  Dior vs YSL                                         [Compare →]   │ ││
│  │  │                                                                     │ ││
│  │  │  You win 58% of direct comparisons                                 │ ││
│  │  │  ...                                                                │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ══════════════════════════════════════════════════════════════════════════ │
│                       SAMPLE RESPONSES TAB                                   │
│  ══════════════════════════════════════════════════════════════════════════ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Recent AI Responses Mentioning Your Brand                              ││
│  │                                                                          ││
│  │  Platform: [All ▼]  Sentiment: [All ▼]  Product: [All ▼]                ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │  ChatGPT                                              2 hours ago  │ ││
│  │  │  Query: "best men's cologne for office"                            │ ││
│  │  │                                                                     │ ││
│  │  │  "For office wear, I'd recommend Dior Sauvage EDP. It's versatile, │ ││
│  │  │   professional, and has excellent longevity. Other options include │ ││
│  │  │   Bleu de Chanel and YSL Y..."                                     │ ││
│  │  │                                                                     │ ││
│  │  │  Position: #1  │  Sentiment: Positive  │  Product: Sauvage EDP     │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                          ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │  Perplexity                                           5 hours ago  │ ││
│  │  │  Query: "dior vs chanel perfume comparison"                        │ ││
│  │  │                                                                     │ ││
│  │  │  "Both houses offer exceptional fragrances. Dior tends toward      │ ││
│  │  │   modern, bold scents while Chanel focuses on timeless elegance..."│ ││
│  │  │                                                                     │ ││
│  │  │  Type: Comparison  │  Sentiment: Neutral  │  Competitor: Chanel    │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Recommendation Card

```tsx
interface RecommendationCardProps {
  recommendation: {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    product?: { id: string; name: string };
    expected_impact: string;
    effort_level: "low" | "medium" | "high";
    status: "pending" | "in_progress" | "completed" | "dismissed";
  };
  onStart: () => void;
  onDismiss: () => void;
  onViewDetails: () => void;
}

const priorityColors = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

export function RecommendationCard({
  recommendation,
  onStart,
  onDismiss,
  onViewDetails,
}: RecommendationCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-2">
          <span className={cn("text-xl", priorityColors[recommendation.priority])}>
            ●
          </span>
          <div className="flex-1">
            <h3 className="font-semibold">{recommendation.title}</h3>
            {recommendation.product && (
              <p className="text-sm text-muted-foreground">
                {recommendation.product.name}
              </p>
            )}
            <p className="mt-2 text-sm">{recommendation.description}</p>

            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <span>Impact: {recommendation.expected_impact}</span>
              <span>Effort: {recommendation.effort_level}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" onClick={onStart}>Start</Button>
        <Button size="sm" variant="outline" onClick={onDismiss}>Dismiss</Button>
        <Button size="sm" variant="ghost" onClick={onViewDetails}>View Details</Button>
      </CardFooter>
    </Card>
  );
}
```

### Share of Voice Chart

```tsx
interface ShareOfVoiceChartProps {
  data: {
    name: string;
    percentage: number;
    change: number;
    isYou?: boolean;
  }[];
}

export function ShareOfVoiceChart({ data }: ShareOfVoiceChartProps) {
  const maxPercentage = Math.max(...data.map(d => d.percentage));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-4">
          <div className="w-24 text-sm font-medium">
            {item.name}
            {item.isYou && <span className="text-muted-foreground"> (You)</span>}
          </div>
          <div className="flex-1">
            <div
              className={cn(
                "h-6 rounded",
                item.isYou ? "bg-primary" : "bg-muted"
              )}
              style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
            />
          </div>
          <div className="w-16 text-right text-sm">{item.percentage}%</div>
          <div className={cn(
            "w-12 text-right text-sm",
            item.change > 0 ? "text-green-500" : item.change < 0 ? "text-red-500" : "text-muted-foreground"
          )}>
            {item.change > 0 ? "↑" : item.change < 0 ? "↓" : "—"} {Math.abs(item.change)}%
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Competitor Comparison Card

```tsx
interface CompetitorComparisonCardProps {
  yourBrand: string;
  competitor: string;
  winRate: number;
  yourStrengths: string[];
  theirStrengths: string[];
  onViewDetails: () => void;
}

export function CompetitorComparisonCard({
  yourBrand,
  competitor,
  winRate,
  yourStrengths,
  theirStrengths,
  onViewDetails,
}: CompetitorComparisonCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {yourBrand} vs {competitor}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          Compare →
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          You win <span className="font-bold">{winRate}%</span> of direct comparisons
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-green-600 mb-2">Your strengths:</p>
            <ul className="space-y-1">
              {yourStrengths.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-red-600 mb-2">Their strengths:</p>
            <ul className="space-y-1">
              {theirStrengths.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### AI Response Card

```tsx
interface AIResponseCardProps {
  response: {
    platform: "chatgpt" | "claude" | "perplexity" | "gemini" | "copilot";
    query_text: string;
    response_text: string;
    mention_position?: number;
    sentiment: "positive" | "neutral" | "negative";
    product?: { name: string };
    competitors_mentioned?: string[];
    queried_at: string;
  };
}

export function AIResponseCard({ response }: AIResponseCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={response.platform} className="w-5 h-5" />
          <span className="font-medium capitalize">{response.platform}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(response.queried_at)}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          Query: "{response.query_text}"
        </p>
        <p className="text-sm bg-muted p-3 rounded">
          "{response.response_text}"
        </p>

        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          {response.mention_position && (
            <span>Position: #{response.mention_position}</span>
          )}
          <span className={cn(
            response.sentiment === "positive" && "text-green-500",
            response.sentiment === "negative" && "text-red-500"
          )}>
            Sentiment: {response.sentiment}
          </span>
          {response.product && (
            <span>Product: {response.product.name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Data Fetching

```tsx
// app/(protected)/insights/page.tsx

export default async function InsightsPage() {
  const { brandId } = await getUserContext();

  const [recommendations, competitors, responses] = await Promise.all([
    getRecommendations(brandId),
    getCompetitorAnalysis(brandId),
    getRecentResponses(brandId, 20),
  ]);

  const summary = {
    high: recommendations.filter(r => r.priority === "high" && r.status === "pending").length,
    medium: recommendations.filter(r => r.priority === "medium" && r.status === "pending").length,
    completed: recommendations.filter(r => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Insights" />

      <Tabs defaultValue="recommendations">
        <TabsList>
          <TabsTrigger value="recommendations">
            Recommendations
            {summary.high > 0 && <Badge className="ml-2">{summary.high}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="responses">Sample Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <RecommendationsSummary summary={summary} />
          <RecommendationsFilters />
          <RecommendationsList recommendations={recommendations} />
        </TabsContent>

        <TabsContent value="competitors">
          <ShareOfVoiceSection data={competitors.shareOfVoice} />
          <CompetitorComparisonsList comparisons={competitors.comparisons} />
        </TabsContent>

        <TabsContent value="responses">
          <ResponseFilters />
          <ResponsesList responses={responses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## API Functions

```typescript
async function getRecommendations(brandId: string) {
  const productIds = await getProductIdsForBrand(brandId);

  const { data } = await supabase
    .from('visibility_recommendations')
    .select(`
      *,
      product:products(id, name)
    `)
    .or(`brand_id.eq.${brandId},product_id.in.(${productIds.join(',')})`)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  return data;
}

async function getCompetitorAnalysis(brandId: string) {
  const competitors = await supabase
    .from('brand_competitors')
    .select('*')
    .eq('brand_id', brandId);

  const brand = await supabase
    .from('brands')
    .select('name')
    .eq('id', brandId)
    .single();

  // Calculate share of voice from visibility queries
  const shareOfVoice = await calculateShareOfVoice(brandId, competitors.data);

  // Get head-to-head comparisons
  const comparisons = await Promise.all(
    competitors.data.map(async (c) => {
      const h2h = await calculateHeadToHead(brandId, c.competitor_name);
      return {
        competitor: c.competitor_name,
        winRate: h2h.winRate,
        yourStrengths: h2h.yourStrengths,
        theirStrengths: h2h.theirStrengths,
      };
    })
  );

  return { shareOfVoice, comparisons };
}

async function getRecentResponses(brandId: string, limit: number) {
  const { data } = await supabase
    .from('visibility_queries')
    .select(`
      *,
      product:products(id, name)
    `)
    .eq('brand_id', brandId)
    .eq('product_mentioned', true)
    .order('queried_at', { ascending: false })
    .limit(limit);

  return data;
}
```

---

## Add Competitor Modal

```tsx
function AddCompetitorModal({ brandId, open, onClose }) {
  async function handleSubmit(data) {
    await supabase.from('brand_competitors').insert({
      brand_id: brandId,
      competitor_name: data.name,
      competitor_type: data.type,
      notes: data.notes,
    });

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Input
            label="Competitor Name"
            placeholder="e.g., Chanel"
            required
          />

          <Select
            label="Competitor Type"
            options={[
              { value: 'direct', label: 'Direct Competitor' },
              { value: 'indirect', label: 'Indirect Competitor' },
              { value: 'aspirational', label: 'Aspirational Competitor' },
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

## See Also

- [Overview Page](OVERVIEW.md)
- [Products Page](PRODUCTS.md)
- [Components](../COMPONENTS.md)
