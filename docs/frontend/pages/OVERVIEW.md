# Overview Page

## Route

`/overview`

## Purpose

The Overview page is the main dashboard for the currently selected brand. It shows visibility metrics, platform performance, and key stats at a glance.

---

## Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Overview                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Brand Header                                      ││
│  │  ┌────────┐                                                             ││
│  │  │  Logo  │   Dior                                                      ││
│  │  └────────┘   Luxury Fashion & Beauty                                   ││
│  │               12 Products tracked                                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ │
│  │  Visibility Score    │ │  Recommendation Rate │ │  Share of Voice      │ │
│  │                      │ │                      │ │                      │ │
│  │         72           │ │         45%          │ │         28%          │ │
│  │        ───           │ │        ───           │ │        ───           │ │
│  │      ↑ +5 vs last    │ │      ↑ +8% vs last   │ │      ↓ -2% vs last   │ │
│  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Platform Performance                                                    ││
│  │                                                                          ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      ││
│  │  │ ChatGPT  │ │  Claude  │ │Perplexity│ │  Gemini  │ │ Copilot  │      ││
│  │  │    75    │ │    68    │ │    82    │ │    65    │ │    70    │      ││
│  │  │   ↑ +3   │ │   ↓ -2   │ │   ↑ +5   │ │   — 0    │ │   ↑ +1   │      ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Visibility Trend (Last 30 Days)                                        ││
│  │                                                                          ││
│  │  80 ─┼────────────────────────────────────                              ││
│  │      │              ╭──╮    ╭────────╮                                  ││
│  │  70 ─┼───────────╭──╯  ╰────╯        ╰───╮                              ││
│  │      │     ╭─────╯                       ╰──                            ││
│  │  60 ─┼─────╯                                                            ││
│  │      │                                                                   ││
│  │  50 ─┼────────────────────────────────────                              ││
│  │      └──────────────────────────────────────                            ││
│  │        Mar 1        Mar 15         Apr 1                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Top Products                                              View All →   ││
│  │                                                                          ││
│  │  ┌────┬─────────────────────────────┬───────┬─────────┬────────────┐    ││
│  │  │ #  │ Product                     │ Score │ Change  │ Mentions   │    ││
│  │  ├────┼─────────────────────────────┼───────┼─────────┼────────────┤    ││
│  │  │ 1  │ Sauvage Eau de Parfum       │  85   │  ↑ +3   │   127      │    ││
│  │  │ 2  │ Miss Dior                   │  78   │  ↑ +5   │    98      │    ││
│  │  │ 3  │ J'adore                     │  75   │  — 0    │    87      │    ││
│  │  │ 4  │ Dior Homme                  │  72   │  ↓ -2   │    65      │    ││
│  │  │ 5  │ Capture Totale              │  68   │  ↑ +1   │    54      │    ││
│  │  └────┴─────────────────────────────┴───────┴─────────┴────────────┘    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────┐ ┌────────────────────────────────────┐│
│  │  Recent Insights           (3)   │ │  Top Competitors                   ││
│  │                                  │ │                                    ││
│  │  ● High: Improve Sauvage desc    │ │  1. Chanel      35% SOV  ↑ +2%    ││
│  │  ● Med: Add pricing info         │ │  2. You (Dior)  28% SOV  ↓ -2%    ││
│  │  ● Med: Update Miss Dior claims  │ │  3. YSL         22% SOV  — 0%     ││
│  │                                  │ │  4. Guerlain    15% SOV  ↓ -1%    ││
│  │  View All →                      │ │                                    ││
│  └──────────────────────────────────┘ └────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Brand Header

```tsx
interface BrandHeaderProps {
  brand: {
    name: string;
    logo_url?: string;
    description?: string;
  };
  productCount: number;
}

export function BrandHeader({ brand, productCount }: BrandHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-6 bg-card rounded-lg">
      {brand.logo_url ? (
        <img src={brand.logo_url} className="w-16 h-16 rounded" />
      ) : (
        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
          <Tag className="w-8 h-8" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{brand.name}</h1>
        <p className="text-muted-foreground">{brand.description}</p>
        <p className="text-sm text-muted-foreground">{productCount} Products tracked</p>
      </div>
    </div>
  );
}
```

### Stats Cards

```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

export function StatCard({ title, value, change, changeLabel }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {change !== undefined && (
          <p className={cn(
            "text-sm",
            change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
          )}>
            {change > 0 ? "↑" : change < 0 ? "↓" : "—"} {Math.abs(change)} {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Platform Score Cards

```tsx
interface PlatformScoreCardProps {
  platform: "chatgpt" | "claude" | "perplexity" | "gemini" | "copilot";
  score: number;
  change: number;
}

const platformNames = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  gemini: "Gemini",
  copilot: "Copilot",
};

export function PlatformScoreCard({ platform, score, change }: PlatformScoreCardProps) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <PlatformIcon platform={platform} className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{platformNames[platform]}</p>
        <p className="text-2xl font-bold">{score}</p>
        <p className={cn(
          "text-sm",
          change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
        )}>
          {change > 0 ? "↑" : change < 0 ? "↓" : "—"} {Math.abs(change)}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

## Data Fetching

```tsx
// app/(protected)/overview/page.tsx

export default async function OverviewPage() {
  const { brandId } = await getUserContext();

  const [brand, report, products, insights, competitors] = await Promise.all([
    getBrand(brandId),
    getBrandVisibilityReport(brandId),
    getTopProducts(brandId, 5),
    getRecentInsights(brandId, 3),
    getTopCompetitors(brandId, 4),
  ]);

  return (
    <div className="space-y-6">
      <BrandHeader brand={brand} productCount={products.length} />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Visibility Score"
          value={report.overall_visibility_score}
          change={report.visibility_change}
          changeLabel="vs last week"
        />
        <StatCard
          title="Recommendation Rate"
          value={`${report.recommendation_rate}%`}
          change={report.recommendation_rate_change}
          changeLabel="vs last week"
        />
        <StatCard
          title="Share of Voice"
          value={`${report.share_of_voice}%`}
          change={report.sov_change}
          changeLabel="vs last week"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <PlatformScoreCard platform="chatgpt" score={report.chatgpt_score} change={3} />
            <PlatformScoreCard platform="claude" score={report.claude_score} change={-2} />
            <PlatformScoreCard platform="perplexity" score={report.perplexity_score} change={5} />
            <PlatformScoreCard platform="gemini" score={report.gemini_score} change={0} />
            <PlatformScoreCard platform="copilot" score={report.copilot_score} change={1} />
          </div>
        </CardContent>
      </Card>

      <VisibilityTrendChart data={report.trend_data} />

      <TopProductsTable products={products} />

      <div className="grid grid-cols-2 gap-4">
        <RecentInsightsCard insights={insights} />
        <TopCompetitorsCard competitors={competitors} yourBrand={brand.name} />
      </div>
    </div>
  );
}
```

---

## API Functions

```typescript
async function getBrandVisibilityReport(brandId: string) {
  const { data } = await supabase
    .from('brand_visibility_reports')
    .select('*')
    .eq('brand_id', brandId)
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  return data;
}

async function getTopProducts(brandId: string, limit: number) {
  const { data } = await supabase
    .from('products')
    .select(`
      *,
      product_visibility_reports(
        overall_visibility_score,
        visibility_change,
        total_mentions
      )
    `)
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .order('product_visibility_reports.overall_visibility_score', { ascending: false })
    .limit(limit);

  return data;
}
```

---

## See Also

- [Insights Page](INSIGHTS.md)
- [Products Page](PRODUCTS.md)
- [Components](../COMPONENTS.md)
