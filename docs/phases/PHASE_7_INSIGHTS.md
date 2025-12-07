# Phase 7: Recommendations & Insights

## Overview

Implement AI-generated recommendations for improving visibility.

**Priority:** Medium
**Dependencies:** Phase 4 (Visibility Engine)

---

## Checklist

### Recommendations Page

- [ ] Create `/recommendations` route
- [ ] Summary cards (high/medium/low priority)
- [ ] Recommendation cards with actions
- [ ] Filter by priority/status/type
- [ ] Detail modal

### Recommendation Generation

- [ ] Analyze visibility data for issues
- [ ] Generate actionable recommendations
- [ ] Assign priority and effort levels
- [ ] Link to evidence (queries/responses)

### Status Tracking

- [ ] Start/dismiss/complete actions
- [ ] Assignment to team members
- [ ] Completion tracking

---

## Implementation Steps

### Step 1: Create Recommendations Page

```tsx
// app/(protected)/recommendations/page.tsx

export default async function RecommendationsPage() {
  const orgId = await getCurrentOrgId();
  const recommendations = await getRecommendations(orgId);

  const summary = {
    high: recommendations.filter(r => r.priority === 'high' && r.status === 'pending').length,
    medium: recommendations.filter(r => r.priority === 'medium' && r.status === 'pending').length,
    low: recommendations.filter(r => r.priority === 'low' && r.status === 'pending').length,
  };

  return (
    <div>
      <PageHeader title="Recommendations" />

      <RecommendationsSummary summary={summary} />

      <RecommendationsFilters
        filters={filters}
        onChange={setFilters}
      />

      <div className="space-y-6">
        {recommendations.filter(r => r.priority === 'high').length > 0 && (
          <RecommendationSection
            title="High Priority"
            recommendations={recommendations.filter(r => r.priority === 'high')}
          />
        )}

        {recommendations.filter(r => r.priority === 'medium').length > 0 && (
          <RecommendationSection
            title="Medium Priority"
            recommendations={recommendations.filter(r => r.priority === 'medium')}
          />
        )}

        {/* Completed section */}
        <RecommendationSection
          title="Completed (This Week)"
          recommendations={recommendations.filter(r => r.status === 'completed')}
          collapsed
        />
      </div>
    </div>
  );
}
```

### Step 2: Recommendation Card

```tsx
interface RecommendationCardProps {
  recommendation: Recommendation;
  onStart: () => void;
  onDismiss: () => void;
  onViewDetail: () => void;
}

export function RecommendationCard({
  recommendation,
  onStart,
  onDismiss,
  onViewDetail,
}: RecommendationCardProps) {
  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <span className={priorityColors[recommendation.priority]}>●</span>
          <div className="flex-1">
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {recommendation.brand?.name} / {recommendation.product?.name}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm">{recommendation.description}</p>

        <div className="mt-4 flex gap-4 text-sm">
          <span>Expected Impact: {recommendation.expected_impact}</span>
          <span>Effort: {recommendation.effort_level}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button size="sm" onClick={onStart}>Start</Button>
        <Button size="sm" variant="outline" onClick={onDismiss}>Dismiss</Button>
        <Button size="sm" variant="ghost" onClick={onViewDetail}>Details</Button>
      </CardFooter>
    </Card>
  );
}
```

### Step 3: Recommendation Detail Modal

```tsx
function RecommendationDetailModal({ recommendation, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recommendation.title}</DialogTitle>
          <Badge>{recommendation.priority} priority</Badge>
        </DialogHeader>

        <div className="space-y-6">
          {/* Issue Section */}
          <Section title="Issue Detected">
            <p>{recommendation.description}</p>
          </Section>

          {/* Recommendation Section */}
          <Section title="Recommendation">
            <p>{recommendation.rationale}</p>
          </Section>

          {/* Evidence Section */}
          <Section title="Evidence">
            {recommendation.evidence?.map(e => (
              <Card key={e.query}>
                <p className="font-medium">Query: {e.query}</p>
                <p className="text-sm text-muted-foreground">Platform: {e.platform}</p>
                <p className="mt-2 text-sm">{e.response}</p>
              </Card>
            ))}
          </Section>

          {/* Impact Section */}
          <Section title="Impact & Effort">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Expected Impact</p>
                <Progress value={parseInt(recommendation.expected_impact)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Effort</p>
                <Badge>{recommendation.effort_level}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <Badge>{recommendation.confidence || 'High'}</Badge>
              </div>
            </div>
          </Section>

          {/* Assignment */}
          <Section title="Assign To">
            <Select
              options={teamMembers}
              value={recommendation.assigned_to}
              onChange={handleAssign}
              placeholder="Select team member..."
            />
          </Section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDismiss}>Dismiss</Button>
          <Button variant="outline" onClick={handleStart}>Start</Button>
          <Button onClick={handleComplete}>Mark Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Recommendation Generation

### Recommendation Types

| Type | Detection | Example |
|------|-----------|---------|
| `content` | Missing or outdated info | "Update product description" |
| `positioning` | Losing to competitors | "Improve differentiation vs X" |
| `seo` | Low discoverability | "Add keywords to content" |
| `pr` | Low mention rate | "Issue press release" |
| `technical` | Missing metadata | "Add structured data" |

### Generation Logic

```python
# In visibility_crew.py or separate recommendation_generator.py

def generate_recommendations(
    product_id: str,
    visibility_data: dict,
    competitor_data: dict
) -> list[Recommendation]:
    recommendations = []

    # Check for low visibility
    if visibility_data['overall_score'] < 50:
        recommendations.append({
            'type': 'content',
            'priority': 'high',
            'title': f'Improve visibility for {product_name}',
            'description': 'Product has low AI visibility across platforms.',
            'rationale': 'Consider updating product description, adding more detailed information.',
            'expected_impact': '+20% visibility',
            'effort_level': 'medium',
        })

    # Check for negative sentiment
    if visibility_data['sentiment_score'] < 0:
        recommendations.append({
            'type': 'pr',
            'priority': 'high',
            'title': 'Address negative sentiment',
            'description': 'AI platforms are mentioning negative aspects.',
            'rationale': f'Common issues: {visibility_data["negative_attributes"]}',
            'expected_impact': '+15% positive mentions',
            'effort_level': 'high',
        })

    # Check competitor performance
    for competitor in competitor_data:
        if competitor['win_rate'] < 40:
            recommendations.append({
                'type': 'positioning',
                'priority': 'medium',
                'title': f'Improve positioning vs {competitor["name"]}',
                'description': f'Losing {100 - competitor["win_rate"]}% of comparisons.',
                'rationale': 'Highlight unique differentiators.',
                'expected_impact': '+10% win rate',
                'effort_level': 'medium',
            })

    # Check for missing information
    if not visibility_data['ingredients_mentioned']:
        recommendations.append({
            'type': 'content',
            'priority': 'low',
            'title': 'Add ingredient information',
            'description': 'AI platforms cannot find ingredient details.',
            'expected_impact': '+5% mentions in ingredient queries',
            'effort_level': 'low',
        })

    return recommendations
```

### Scheduled Generation

```yaml
# n8n Workflow: Generate Recommendations

trigger:
  type: cron
  schedule: "0 3 * * *"  # Daily at 3 AM (after visibility analysis)

nodes:
  - name: Get Products with New Data
    type: Supabase
    query: |
      SELECT p.*, pvr.*
      FROM products p
      JOIN product_visibility_reports pvr ON p.id = pvr.product_id
      WHERE pvr.report_date = CURRENT_DATE

  - name: For Each Product
    type: SplitInBatches

  - name: Generate Recommendations
    type: Code
    # Run recommendation generation logic

  - name: Insert Recommendations
    type: Supabase
    operation: Insert
    table: visibility_recommendations
```

---

## API Functions

### getRecommendations

```typescript
async function getRecommendations(orgId: string, filters?: {
  priority?: string;
  status?: string;
  type?: string;
}) {
  const brandIds = await getUserBrandIds(orgId);
  const productIds = await getUserProductIds(orgId);

  let query = supabase
    .from('visibility_recommendations')
    .select(`
      *,
      brand:brands(id, name),
      product:products(id, name)
    `)
    .or(`brand_id.in.(${brandIds.join(',')}),product_id.in.(${productIds.join(',')})`)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.type) {
    query = query.eq('recommendation_type', filters.type);
  }

  return query;
}
```

### updateRecommendationStatus

```typescript
async function updateRecommendationStatus(
  recommendationId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed',
  assignedTo?: string
) {
  const updates: any = { status };

  if (assignedTo) {
    updates.assigned_to = assignedTo;
  }

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  return supabase
    .from('visibility_recommendations')
    .update(updates)
    .eq('id', recommendationId);
}
```

---

## Notification Badge

Show pending high-priority count in sidebar:

```tsx
// In navigation
const highPriorityCount = recommendations.filter(
  r => r.priority === 'high' && r.status === 'pending'
).length;

<NavItem
  href="/recommendations"
  icon={Lightbulb}
  badge={highPriorityCount > 0 ? highPriorityCount : undefined}
>
  Recommendations
</NavItem>
```

---

## Testing

### Recommendation Generation

1. Low visibility triggers recommendation
2. Negative sentiment triggers recommendation
3. Competitor losses trigger recommendation
4. Missing info triggers recommendation

### Status Flow

1. Start moves to in_progress
2. Complete moves to completed
3. Dismiss moves to dismissed
4. Assignment works

### Filtering

1. Priority filter works
2. Status filter works
3. Type filter works

---

## Complete!

Phase 7 completes the core implementation. The platform now has:

1. Multi-tenant organization structure
2. Brand and product management
3. AI visibility monitoring
4. Comprehensive reporting
5. Competitor tracking
6. AI-generated recommendations

---

## See Also

- [Recommendations Page Design](../frontend/pages/RECOMMENDATIONS.md)
- [Architecture Overview](../architecture/OVERVIEW.md)
