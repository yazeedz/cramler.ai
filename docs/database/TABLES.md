# Database Table Definitions

## Table of Contents

1. [organizations](#1-organizations)
2. [organization_members](#2-organization_members)
3. [categories](#3-categories)
4. [brands](#4-brands)
5. [products](#5-products-updated)
6. [brand_competitors](#6-brand_competitors)
7. [product_competitors](#7-product_competitors)
8. [brand_visibility_reports](#8-brand_visibility_reports)
9. [product_visibility_reports](#9-product_visibility_reports)
10. [visibility_queries](#10-visibility_queries)
11. [visibility_recommendations](#11-visibility_recommendations)

---

## 1. organizations

**Purpose:** Top-level tenant entity. Each organization can have multiple brands.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                          -- "LVMH"
    slug TEXT UNIQUE NOT NULL,                   -- "lvmh"
    logo_url TEXT,
    website TEXT,
    industry TEXT,                               -- "Luxury Goods"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | TEXT | Yes | Organization display name |
| `slug` | TEXT | Yes | URL-safe identifier (unique) |
| `logo_url` | TEXT | No | Organization logo |
| `website` | TEXT | No | Organization website |
| `industry` | TEXT | No | Industry category |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Auto | Last update timestamp |

---

## 2. organization_members

**Purpose:** Links users to organizations with role-based access and tracks their current brand context.

```sql
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'analyst', 'viewer')),

    -- Current brand context (which brand user is viewing)
    current_brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,

    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, user_id)
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `organization_id` | UUID | Yes | FK to organizations |
| `user_id` | UUID | Yes | FK to auth.users |
| `role` | TEXT | Yes | User role (see below) |
| `current_brand_id` | UUID | No | Currently selected brand for this user |
| `invited_by` | UUID | No | Who invited this user |
| `invited_at` | TIMESTAMPTZ | No | When invitation was sent |
| `accepted_at` | TIMESTAMPTZ | No | When invitation was accepted |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |

### User Context Model

Each user is attached to:
- **One organization** at a time (determined by the organization_members row)
- **One brand** within that organization (stored in `current_brand_id`)

When a user switches brands in the UI, update `current_brand_id`. When they switch organizations, query the appropriate `organization_members` row.

### Roles

| Role | Permissions |
|------|-------------|
| `owner` | Full access, can delete organization |
| `admin` | Full access except delete org |
| `manager` | Manage brands and products |
| `analyst` | View all, edit assigned items |
| `viewer` | Read-only access |

---

## 3. categories

**Purpose:** Optional grouping for brands within an organization.

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                          -- "Perfumes & Cosmetics"
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `organization_id` | UUID | Yes | FK to organizations |
| `name` | TEXT | Yes | Category display name |
| `slug` | TEXT | Yes | URL-safe identifier |
| `description` | TEXT | No | Category description |
| `sort_order` | INT | No | Display order |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |

---

## 4. brands

**Purpose:** Brand entities belonging to an organization.

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    name TEXT NOT NULL,                          -- "Dior"
    slug TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,

    -- Brand metadata
    founded_year INT,
    headquarters TEXT,
    market_position TEXT,                        -- "Luxury", "Premium", "Mass Market"

    -- Tracking settings
    is_active BOOLEAN DEFAULT true,
    track_competitors BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `organization_id` | UUID | Yes | FK to organizations |
| `category_id` | UUID | No | FK to categories |
| `name` | TEXT | Yes | Brand display name |
| `slug` | TEXT | Yes | URL-safe identifier |
| `logo_url` | TEXT | No | Brand logo |
| `description` | TEXT | No | Brand description |
| `website` | TEXT | No | Brand website |
| `founded_year` | INT | No | Year founded |
| `headquarters` | TEXT | No | HQ location |
| `market_position` | TEXT | No | Market segment |
| `is_active` | BOOLEAN | Auto | Active for tracking |
| `track_competitors` | BOOLEAN | Auto | Track competitors |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Auto | Last update |

---

## 5. products (Updated)

**Purpose:** Products to track. Updated to reference brands.

```sql
-- Add new columns to existing products table
ALTER TABLE products
    ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    ADD COLUMN slug TEXT,
    ADD COLUMN sku TEXT,
    ADD COLUMN product_url TEXT,
    ADD COLUMN is_active BOOLEAN DEFAULT true,
    ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add constraints
ALTER TABLE products ADD CONSTRAINT products_brand_slug_unique UNIQUE(brand_id, slug);
CREATE INDEX idx_products_brand ON products(brand_id);
```

### Full Schema After Update

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `brand_id` | UUID | Yes (new) | FK to brands |
| `user_id` | UUID | No | Legacy: original creator |
| `name` | TEXT | Yes | Product name |
| `slug` | TEXT | Yes (new) | URL-safe identifier |
| `sku` | TEXT | No (new) | Internal product code |
| `brand` | TEXT | No | Legacy: brand name (keep for now) |
| `description` | TEXT | No | Product description |
| `price` | TEXT | No | Price string |
| `product_type` | TEXT | No | Type (serum, cream, etc.) |
| `main_category` | TEXT | No | Main category |
| `sub_category` | TEXT | No | Sub category |
| `target_audience` | TEXT | No | Target audience |
| `ingredients` | TEXT[] | No | Ingredient list |
| `claims` | TEXT[] | No | Product claims |
| `what_it_does` | TEXT | No | Product benefits |
| `main_difference` | TEXT | No | USP/differentiator |
| `image_url` | TEXT | No | Product image |
| `product_url` | TEXT | No (new) | Official product page |
| `sources` | JSONB | No | Research sources |
| `status` | TEXT | Auto | pending/researching/ready/error |
| `is_active` | BOOLEAN | Auto (new) | Active for tracking |
| `created_by` | UUID | No (new) | Who added this product |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Auto | Last update |

---

## 6. brand_competitors

**Purpose:** Track competing brands for comparison.

```sql
CREATE TABLE brand_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

    competitor_name TEXT NOT NULL,               -- "Chanel"
    competitor_type TEXT CHECK (competitor_type IN ('direct', 'indirect', 'aspirational')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(brand_id, competitor_name)
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `brand_id` | UUID | Yes | FK to brands |
| `competitor_name` | TEXT | Yes | Competitor brand name |
| `competitor_type` | TEXT | No | direct/indirect/aspirational |
| `notes` | TEXT | No | Additional notes |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |

---

## 7. product_competitors

**Purpose:** Track competing products for comparison.

```sql
CREATE TABLE product_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    competitor_product TEXT NOT NULL,            -- "Bleu de Chanel"
    competitor_brand TEXT,                       -- "Chanel"
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, competitor_product)
);
```

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `product_id` | UUID | Yes | FK to products |
| `competitor_product` | TEXT | Yes | Competitor product name |
| `competitor_brand` | TEXT | No | Competitor brand name |
| `notes` | TEXT | No | Additional notes |
| `created_at` | TIMESTAMPTZ | Auto | Creation timestamp |

---

## 8. brand_visibility_reports

**Purpose:** Aggregate visibility reports at the brand level.

```sql
CREATE TABLE brand_visibility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

    report_date DATE NOT NULL,
    report_period TEXT DEFAULT 'daily' CHECK (report_period IN ('daily', 'weekly', 'monthly')),

    -- Overall visibility score (0-100)
    overall_visibility_score DECIMAL(5,2),

    -- Per-platform visibility scores
    chatgpt_score DECIMAL(5,2),
    claude_score DECIMAL(5,2),
    perplexity_score DECIMAL(5,2),
    gemini_score DECIMAL(5,2),
    copilot_score DECIMAL(5,2),

    -- Mention counts
    total_mentions INT DEFAULT 0,
    positive_mentions INT DEFAULT 0,
    neutral_mentions INT DEFAULT 0,
    negative_mentions INT DEFAULT 0,

    -- Competitive metrics
    share_of_voice DECIMAL(5,2),                 -- % of mentions vs competitors
    competitive_rank INT,                        -- Rank among tracked competitors

    -- Sentiment
    avg_sentiment_score DECIMAL(3,2),            -- -1 to +1

    -- Recommendation metrics
    recommendation_rate DECIMAL(5,2),            -- % of times recommended
    first_choice_rate DECIMAL(5,2),              -- % of times recommended first

    -- Trends (vs previous period)
    visibility_change DECIMAL(5,2),              -- +/- from last report
    mentions_change INT,

    -- Sample data (JSONB for flexibility)
    sample_queries JSONB,                        -- Top queries that triggered mentions
    sample_responses JSONB,                      -- Example AI responses
    top_strengths JSONB,                         -- What AI says positively
    top_weaknesses JSONB,                        -- What AI says negatively

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(brand_id, report_date, report_period)
);
```

| Column | Type | Description |
|--------|------|-------------|
| `overall_visibility_score` | DECIMAL(5,2) | 0-100 score |
| `chatgpt_score` | DECIMAL(5,2) | ChatGPT-specific score |
| `claude_score` | DECIMAL(5,2) | Claude-specific score |
| `perplexity_score` | DECIMAL(5,2) | Perplexity-specific score |
| `gemini_score` | DECIMAL(5,2) | Gemini-specific score |
| `copilot_score` | DECIMAL(5,2) | Copilot-specific score |
| `share_of_voice` | DECIMAL(5,2) | % vs competitors |
| `recommendation_rate` | DECIMAL(5,2) | % recommended |
| `first_choice_rate` | DECIMAL(5,2) | % first choice |
| `sample_queries` | JSONB | Example triggering queries |
| `top_strengths` | JSONB | Positive attributes |
| `top_weaknesses` | JSONB | Negative attributes |

---

## 9. product_visibility_reports

**Purpose:** Detailed visibility reports per product.

```sql
CREATE TABLE product_visibility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    report_date DATE NOT NULL,
    report_period TEXT DEFAULT 'daily',

    -- Overall visibility score
    overall_visibility_score DECIMAL(5,2),

    -- Per-platform visibility
    chatgpt_score DECIMAL(5,2),
    chatgpt_mentions INT DEFAULT 0,
    claude_score DECIMAL(5,2),
    claude_mentions INT DEFAULT 0,
    perplexity_score DECIMAL(5,2),
    perplexity_mentions INT DEFAULT 0,
    gemini_score DECIMAL(5,2),
    gemini_mentions INT DEFAULT 0,
    copilot_score DECIMAL(5,2),
    copilot_mentions INT DEFAULT 0,

    -- Mention context
    total_mentions INT DEFAULT 0,
    mentions_as_recommendation INT DEFAULT 0,    -- Recommended to user
    mentions_as_comparison INT DEFAULT 0,        -- Compared to competitor
    mentions_as_example INT DEFAULT 0,           -- Used as example
    mentions_as_warning INT DEFAULT 0,           -- Negative mention

    -- Competitive positioning
    competitor_comparisons JSONB,                -- {"Bleu de Chanel": {"wins": 5, "losses": 3}}
    category_rank INT,                           -- Rank in category

    -- Query analysis
    top_triggering_queries JSONB,                -- Queries that mention this product
    query_categories JSONB,                      -- {"best for gift": 10, "comparison": 5}

    -- Sentiment analysis
    sentiment_score DECIMAL(3,2),                -- -1 to +1
    sentiment_breakdown JSONB,                   -- {"positive": 70, "neutral": 20, "negative": 10}

    -- Key attributes mentioned
    attributes_mentioned JSONB,                  -- {"longevity": 15, "projection": 8}
    positive_attributes JSONB,
    negative_attributes JSONB,

    -- Sample AI responses
    sample_responses JSONB,

    -- Trends
    visibility_change DECIMAL(5,2),
    rank_change INT,

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, report_date, report_period)
);
```

---

## 10. visibility_queries

**Purpose:** Raw log of AI queries and responses for analysis.

```sql
CREATE TABLE visibility_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Can be for brand OR product
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    -- Query details
    ai_platform TEXT NOT NULL,                   -- "chatgpt", "claude", "perplexity"
    ai_model TEXT,                               -- "gpt-4o", "claude-3-opus"
    query_text TEXT NOT NULL,                    -- The prompt sent
    query_category TEXT,                         -- "recommendation", "comparison", "info"

    -- Response
    response_text TEXT,
    response_tokens INT,

    -- Analysis results
    product_mentioned BOOLEAN,
    mention_type TEXT,                           -- "recommended", "compared", "warned"
    mention_position INT,                        -- 1st, 2nd, 3rd recommendation
    sentiment TEXT,                              -- "positive", "neutral", "negative"
    competitors_mentioned TEXT[],

    queried_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visibility_queries_brand ON visibility_queries(brand_id, queried_at DESC);
CREATE INDEX idx_visibility_queries_product ON visibility_queries(product_id, queried_at DESC);
```

---

## 11. visibility_recommendations

**Purpose:** AI-generated recommendations for improving visibility.

```sql
CREATE TABLE visibility_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    recommendation_type TEXT NOT NULL,           -- "content", "positioning", "seo", "pr"
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

    title TEXT NOT NULL,                         -- "Improve product description"
    description TEXT NOT NULL,                   -- Detailed recommendation
    rationale TEXT,                              -- Why this matters

    expected_impact TEXT,                        -- "Could improve visibility by 15%"
    effort_level TEXT CHECK (effort_level IN ('low', 'medium', 'high')),

    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    assigned_to UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes Summary

```sql
-- Organization & membership
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- Brands & products
CREATE INDEX idx_brands_org ON brands(organization_id);
CREATE INDEX idx_brands_category ON brands(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);

-- Reports
CREATE INDEX idx_brand_reports_date ON brand_visibility_reports(brand_id, report_date DESC);
CREATE INDEX idx_product_reports_date ON product_visibility_reports(product_id, report_date DESC);

-- Queries
CREATE INDEX idx_visibility_queries_brand ON visibility_queries(brand_id, queried_at DESC);
CREATE INDEX idx_visibility_queries_product ON visibility_queries(product_id, queried_at DESC);
```

---

## See Also

- [Schema Overview](SCHEMA.md)
- [RLS Policies](RLS_POLICIES.md)
- [Migrations](MIGRATIONS.md)
