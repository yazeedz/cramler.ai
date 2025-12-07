# Phase 5: Reports & Analytics

## Overview

Build the reports dashboard and analytics visualizations.

**Priority:** High
**Dependencies:** Phase 4 (Visibility Engine)

---

## Checklist

### Reports Overview Page

- [ ] Create `/reports` route
- [ ] Time period selector
- [ ] Organization summary stats
- [ ] Visibility trend chart
- [ ] Brand reports table
- [ ] Export options (PDF, Excel)

### Brand Report Page

- [ ] Create `/reports/brands/[id]` route
- [ ] Executive summary section
- [ ] Platform performance table
- [ ] Product performance table
- [ ] Sentiment analysis
- [ ] Competitive analysis
- [ ] Top triggering queries
- [ ] Sample AI responses

### Product Report Page

- [ ] Create `/reports/products/[id]` route
- [ ] Similar to brand report
- [ ] Product-specific metrics

### Charts & Visualizations

- [ ] Visibility trend line chart
- [ ] Platform comparison bar chart
- [ ] Share of voice pie chart
- [ ] Sentiment breakdown chart
- [ ] Rank change indicator

### Export Functionality

- [ ] PDF report generation
- [ ] Excel data export
- [ ] Email scheduling

---

## Implementation Steps

### Step 1: Install Chart Library

```bash
npm install recharts
# or
npm install @nivo/core @nivo/line @nivo/bar @nivo/pie
```

### Step 2: Create Reports Page

```tsx
// app/(protected)/reports/page.tsx

export default async function ReportsPage() {
  const orgId = await getCurrentOrgId();
  const reportData = await getOrganizationReport(orgId);

  return (
    <div>
      <PageHeader title="Reports">
        <TimePeriodSelector />
        <ExportButton />
      </PageHeader>

      <OrganizationSummary data={reportData.summary} />

      <VisibilityTrendChart data={reportData.trend} />

      <BrandReportsTable brands={reportData.brands} />
    </div>
  );
}
```

### Step 3: Create Chart Components

#### VisibilityTrendChart

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface TrendChartProps {
  data: { date: string; score: number; competitors?: { name: string; score: number }[] }[];
}

export function VisibilityTrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={600} height={300} data={data}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" name="Your Score" stroke="#8884d8" />
          {/* Competitor lines */}
        </LineChart>
      </CardContent>
    </Card>
  );
}
```

#### PlatformComparisonChart

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface PlatformChartProps {
  data: { platform: string; score: number; change: number }[];
}

export function PlatformComparisonChart({ data }: PlatformChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart width={600} height={300} data={data}>
          <XAxis dataKey="platform" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="score" fill="#8884d8" />
        </BarChart>
      </CardContent>
    </Card>
  );
}
```

#### ShareOfVoiceChart

```tsx
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ShareOfVoiceChartProps {
  data: { name: string; value: number; isYou?: boolean }[];
}

export function ShareOfVoiceChart({ data }: ShareOfVoiceChartProps) {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#888888'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share of Voice</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.isYou ? '#8884d8' : COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Create Brand Report Page

```tsx
// app/(protected)/reports/brands/[id]/page.tsx

export default async function BrandReportPage({ params }) {
  const report = await getBrandReport(params.id);

  return (
    <div>
      <PageHeader title={`${report.brand.name} - Visibility Report`}>
        <TimePeriodSelector />
        <ExportButton type="pdf" />
      </PageHeader>

      <ExecutiveSummary data={report.summary} />

      <div className="grid grid-cols-2 gap-4">
        <PlatformPerformanceTable data={report.platforms} />
        <ProductPerformanceTable data={report.products} />
      </div>

      <SentimentAnalysis data={report.sentiment} />

      <CompetitiveAnalysis data={report.competitors} />

      <TopTriggeringQueries queries={report.topQueries} />

      <SampleResponses responses={report.samples} />
    </div>
  );
}
```

### Step 5: Export Functionality

#### PDF Export

```typescript
// Using react-pdf or jspdf

import { Document, Page, Text, View, PDFDownloadLink } from '@react-pdf/renderer';

function BrandReportPDF({ report }) {
  return (
    <Document>
      <Page>
        <View>
          <Text>{report.brand.name} - Visibility Report</Text>
          {/* Report content */}
        </View>
      </Page>
    </Document>
  );
}

// Usage
<PDFDownloadLink document={<BrandReportPDF report={report} />} fileName="report.pdf">
  {({ loading }) => loading ? 'Generating...' : 'Download PDF'}
</PDFDownloadLink>
```

#### Excel Export

```typescript
// Using xlsx library

import * as XLSX from 'xlsx';

function exportToExcel(report) {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Overall Score', report.summary.score],
    ['Change', report.summary.change],
    // ...
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Products sheet
  const productsSheet = XLSX.utils.json_to_sheet(report.products);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');

  // Download
  XLSX.writeFile(workbook, `${report.brand.name}_report.xlsx`);
}
```

---

## API Functions

### getOrganizationReport

```typescript
async function getOrganizationReport(orgId: string, period: DateRange) {
  // Get aggregate data across all brands
  const brands = await supabase
    .from('brands')
    .select(`
      *,
      brand_visibility_reports(*)
    `)
    .eq('organization_id', orgId);

  // Calculate organization-level metrics
  const summary = calculateOrgSummary(brands);

  // Get trend data
  const trend = await getVisibilityTrend(brands.map(b => b.id), period);

  return { summary, brands, trend };
}
```

### getBrandReport

```typescript
async function getBrandReport(brandId: string, period: DateRange) {
  const brand = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  const report = await supabase
    .from('brand_visibility_reports')
    .select('*')
    .eq('brand_id', brandId)
    .gte('report_date', period.start)
    .lte('report_date', period.end)
    .order('report_date', { ascending: false });

  const products = await supabase
    .from('products')
    .select(`
      *,
      product_visibility_reports(*)
    `)
    .eq('brand_id', brandId);

  const queries = await supabase
    .from('visibility_queries')
    .select('*')
    .eq('brand_id', brandId)
    .order('queried_at', { ascending: false })
    .limit(10);

  return formatBrandReport(brand, report, products, queries);
}
```

---

## Time Period Options

```typescript
type TimePeriod =
  | 'last_7_days'
  | 'last_30_days'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'custom';

function getDateRange(period: TimePeriod): DateRange {
  const now = new Date();

  switch (period) {
    case 'last_7_days':
      return {
        start: subDays(now, 7),
        end: now,
      };
    case 'last_30_days':
      return {
        start: subDays(now, 30),
        end: now,
      };
    // ... etc
  }
}
```

---

## Testing

### Chart Rendering

1. Charts render with sample data
2. Charts handle empty data gracefully
3. Tooltips show correct values
4. Legends are clickable

### Report Generation

1. PDF exports correctly
2. Excel has all data
3. Email scheduling works

### Data Accuracy

1. Scores match raw data
2. Trends are correct
3. Aggregations are accurate

---

## Next Phase

After completing Phase 5, proceed to [Phase 6: Competitor Tracking](PHASE_6_COMPETITORS.md).

---

## See Also

- [Reports Page Design](../frontend/pages/REPORTS.md)
- [Components](../frontend/COMPONENTS.md)
