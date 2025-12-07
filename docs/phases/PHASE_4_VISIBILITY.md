# Phase 4: Visibility Monitoring Engine

## Overview

Build the AI visibility monitoring system that queries AI platforms and generates reports.

**Priority:** High
**Dependencies:** Phase 1-3

---

## Checklist

### CrewAI Visibility Agent

- [ ] Create `visibility_crew.py`
- [ ] Query generator (relevant prompts)
- [ ] Platform queriers (ChatGPT, Claude, Perplexity, Gemini, Copilot)
- [ ] Response analyzer
- [ ] Score calculator
- [ ] Report generator

### n8n Workflow

- [ ] Create visibility monitoring workflow
- [ ] Schedule triggers (daily)
- [ ] Product/brand iteration
- [ ] CrewAI integration
- [ ] Database updates
- [ ] Notification sending

### API Integrations

- [ ] OpenAI API (ChatGPT)
- [ ] Anthropic API (Claude)
- [ ] Perplexity API
- [ ] Google AI API (Gemini)
- [ ] Microsoft API (Copilot)

### Database Updates

- [ ] Insert visibility_queries
- [ ] Insert/update product_visibility_reports
- [ ] Insert/update brand_visibility_reports
- [ ] Generate recommendations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VISIBILITY MONITORING ENGINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        SCHEDULER (n8n Cron)                            │ │
│  │                                                                         │ │
│  │   Daily at 2:00 AM:  Run for all active products                       │ │
│  │   Weekly on Sunday:  Generate weekly reports                           │ │
│  │   Monthly on 1st:    Generate monthly reports                          │ │
│  └───────────────────────────────┬────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      QUERY GENERATOR                                   │ │
│  │                                                                         │ │
│  │   For product "Sauvage EDP":                                           │ │
│  │   1. "best men's cologne 2024"                                         │ │
│  │   2. "dior sauvage review"                                             │ │
│  │   3. "sauvage vs bleu de chanel"                                       │ │
│  │   4. "long lasting men's fragrance"                                    │ │
│  │   5. "gift cologne for boyfriend"                                      │ │
│  └───────────────────────────────┬────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      AI PLATFORM QUERIERS                              │ │
│  │                                                                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │  │ ChatGPT  │ │  Claude  │ │Perplexity│ │  Gemini  │ │ Copilot  │     │ │
│  │  │  API     │ │   API    │ │   API    │ │   API    │ │   API    │     │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │ │
│  └───────────────────────────────┬────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      RESPONSE ANALYZER                                 │ │
│  │                                                                         │ │
│  │   For each response:                                                   │ │
│  │   • Is product mentioned? (yes/no)                                     │ │
│  │   • Mention type (recommended, compared, warned)                       │ │
│  │   • Position (1st, 2nd, 3rd)                                          │ │
│  │   • Sentiment (positive, neutral, negative)                           │ │
│  │   • Competitors mentioned                                              │ │
│  │   • Attributes discussed                                               │ │
│  └───────────────────────────────┬────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      SCORE CALCULATOR                                  │ │
│  │                                                                         │ │
│  │   Visibility Score = weighted sum of:                                  │ │
│  │   • Mention rate (how often mentioned)                                 │ │
│  │   • Position score (1st = 100, 2nd = 80, 3rd = 60)                    │ │
│  │   • Sentiment score (+1, 0, -1)                                       │ │
│  │   • Recommendation rate (% recommended)                                │ │
│  └───────────────────────────────┬────────────────────────────────────────┘ │
│                                  │                                           │
│                                  ▼                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      DATABASE WRITER                                   │ │
│  │                                                                         │ │
│  │   • Insert visibility_queries (raw data)                              │ │
│  │   • Upsert product_visibility_reports                                 │ │
│  │   • Aggregate brand_visibility_reports                                │ │
│  │   • Generate visibility_recommendations                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Create Visibility Crew

```python
# agents/visibility_crew.py

from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
import anthropic
import openai

@tool
def query_chatgpt(query: str) -> str:
    """Query ChatGPT and return response."""
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": query}]
    )
    return response.choices[0].message.content

@tool
def query_claude(query: str) -> str:
    """Query Claude and return response."""
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1024,
        messages=[{"role": "user", "content": query}]
    )
    return response.content[0].text

# Similar tools for Perplexity, Gemini, Copilot...

def create_visibility_crew(product_name: str, brand_name: str, competitors: list):
    """Create a crew for visibility analysis."""

    # Query Generator Agent
    query_generator = Agent(
        role="Query Strategist",
        goal=f"Generate queries to test visibility of {product_name} by {brand_name}",
        backstory="Expert in understanding how users search for products."
    )

    # Platform Querier Agent
    querier = Agent(
        role="AI Platform Analyst",
        goal="Query AI platforms and collect responses",
        tools=[query_chatgpt, query_claude]  # Add other tools
    )

    # Response Analyzer Agent
    analyzer = Agent(
        role="Response Analyst",
        goal="Analyze responses for mentions, sentiment, positioning"
    )

    # Tasks...
    generate_queries = Task(
        description=f"""Generate 5-10 search queries for {product_name}:
        1. Category recommendation queries ("best [category]")
        2. Product review queries ("{product_name} review")
        3. Comparison queries ("{product_name} vs {competitors[0]}")
        4. Use case queries ("[category] for [use case]")
        """,
        agent=query_generator,
        expected_output="List of queries"
    )

    # ... more tasks

    crew = Crew(
        agents=[query_generator, querier, analyzer],
        tasks=[generate_queries, ...],
        process=Process.sequential
    )

    return crew
```

### Step 2: Create FastAPI Endpoint

```python
# agents/main.py (add to existing)

@app.post("/visibility/analyze")
async def analyze_visibility(request: VisibilityRequest):
    """Run visibility analysis for a product."""
    crew = create_visibility_crew(
        product_name=request.product_name,
        brand_name=request.brand_name,
        competitors=request.competitors
    )

    result = crew.kickoff()

    return {
        "product_id": request.product_id,
        "analysis": parse_visibility_result(result)
    }
```

### Step 3: Create n8n Workflow

```yaml
# Visibility Monitoring Workflow

trigger:
  type: cron
  schedule: "0 2 * * *"  # Daily at 2 AM

nodes:
  - name: Get Active Products
    type: Supabase
    query: |
      SELECT p.*, b.name as brand_name,
             array_agg(pc.competitor_product) as competitors
      FROM products p
      JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_competitors pc ON p.id = pc.product_id
      WHERE p.is_active = true
      GROUP BY p.id, b.name

  - name: For Each Product
    type: SplitInBatches

  - name: Call Visibility Crew
    type: HTTP Request
    url: http://host.docker.internal:8000/visibility/analyze
    method: POST
    body:
      product_id: "={{ $json.id }}"
      product_name: "={{ $json.name }}"
      brand_name: "={{ $json.brand_name }}"
      competitors: "={{ $json.competitors }}"
    timeout: 300000  # 5 minutes

  - name: Save Visibility Queries
    type: Supabase
    operation: Insert
    table: visibility_queries

  - name: Update Product Report
    type: Supabase
    operation: Upsert
    table: product_visibility_reports

  - name: Check for Alerts
    type: IF
    condition: "={{ $json.score_change > 10 || $json.score_change < -10 }}"

  - name: Send Alert
    type: HTTP Request
    url: WebSocket notification endpoint
```

### Step 4: Score Calculation

```typescript
function calculateVisibilityScore(queryResults: QueryResult[]): number {
  const weights = {
    mentionRate: 0.30,
    positionScore: 0.25,
    recommendationRate: 0.25,
    sentimentScore: 0.20,
  };

  const mentionRate = queryResults.filter(q => q.mentioned).length / queryResults.length;

  const positionScore = queryResults
    .filter(q => q.mentioned)
    .reduce((sum, q) => {
      if (q.position === 1) return sum + 100;
      if (q.position === 2) return sum + 80;
      if (q.position === 3) return sum + 60;
      return sum + 40;
    }, 0) / queryResults.filter(q => q.mentioned).length || 0;

  const recommendationRate = queryResults
    .filter(q => q.mentionType === 'recommended').length / queryResults.length;

  const sentimentScore = queryResults
    .filter(q => q.mentioned)
    .reduce((sum, q) => {
      if (q.sentiment === 'positive') return sum + 1;
      if (q.sentiment === 'negative') return sum - 1;
      return sum;
    }, 0) / queryResults.filter(q => q.mentioned).length || 0;

  // Normalize sentiment to 0-100
  const normalizedSentiment = (sentimentScore + 1) * 50;

  return (
    mentionRate * 100 * weights.mentionRate +
    positionScore * weights.positionScore +
    recommendationRate * 100 * weights.recommendationRate +
    normalizedSentiment * weights.sentimentScore
  );
}
```

---

## API Keys Needed

| Service | Env Variable | Cost |
|---------|--------------|------|
| OpenAI | `OPENAI_API_KEY` | ~$0.01/query |
| Anthropic | `ANTHROPIC_API_KEY` | ~$0.01/query |
| Perplexity | `PERPLEXITY_API_KEY` | ~$0.01/query |
| Google AI | `GOOGLE_AI_API_KEY` | Free tier available |
| Microsoft | `MICROSOFT_API_KEY` | Varies |

---

## Testing

### Unit Tests

```python
def test_query_generator():
    queries = generate_queries("Sauvage EDP", "Dior", ["Bleu de Chanel"])
    assert len(queries) >= 5
    assert any("sauvage" in q.lower() for q in queries)
    assert any("vs" in q.lower() for q in queries)

def test_response_analyzer():
    response = "For men's cologne, I'd recommend Dior Sauvage..."
    analysis = analyze_response(response, "Sauvage")
    assert analysis.mentioned == True
    assert analysis.position == 1
    assert analysis.sentiment == "positive"

def test_score_calculator():
    results = [
        {"mentioned": True, "position": 1, "sentiment": "positive"},
        {"mentioned": True, "position": 2, "sentiment": "positive"},
        {"mentioned": False},
    ]
    score = calculate_visibility_score(results)
    assert 60 <= score <= 80
```

### Integration Test

1. Run visibility analysis for test product
2. Verify queries logged in database
3. Verify report generated
4. Check scores are reasonable

---

## Next Phase

After completing Phase 4, proceed to [Phase 5: Reports & Analytics](PHASE_5_REPORTS.md).

---

## See Also

- [Architecture Overview](../architecture/OVERVIEW.md)
- [Reports Page Design](../frontend/pages/REPORTS.md)
