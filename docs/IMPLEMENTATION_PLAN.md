# Cramler.ai - AI Visibility Monitoring Platform

## Implementation Plan

---

## Executive Summary

Transform Cramler.ai from a single-user product research tool into a **multi-tenant AI visibility monitoring platform** where organizations can track how their brands and products appear across AI platforms (ChatGPT, Claude, Perplexity, Gemini, Copilot).

---

## Phase Overview

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| **Phase 1** | Database Schema & Migration | Foundation | 🔴 Critical |
| **Phase 2** | Organization & Brand Management | Core Features | 🔴 Critical |
| **Phase 3** | Product Management Refactor | Core Features | 🟡 High |
| **Phase 4** | Visibility Monitoring Engine | Core Features | 🟡 High |
| **Phase 5** | Reports & Analytics Dashboard | Value Delivery | 🟡 High |
| **Phase 6** | Competitor Tracking | Enhancement | 🟢 Medium |
| **Phase 7** | Recommendations & Insights | Enhancement | 🟢 Medium |

---

# Phase 1: Database Schema & Migration

## 1.1 New Tables to Create

### Core Entity Tables

```sql
-- ============================================================================
-- ORGANIZATIONS (Top-level tenant)
-- ============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ORGANIZATION MEMBERS (Users belonging to org)
-- ============================================================================
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'analyst', 'viewer')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- CATEGORIES (Optional grouping for brands within org)
-- ============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);

-- ============================================================================
-- BRANDS (Under an organization)
-- ============================================================================
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,

    -- Brand metadata
    founded_year INT,
    headquarters TEXT,
    market_position TEXT,  -- "Luxury", "Premium", "Mass Market"

    -- Tracking settings
    is_active BOOLEAN DEFAULT true,
    track_competitors BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);
```

### Updated Products Table

```sql
-- ============================================================================
-- PRODUCTS (Updated to reference brands)
-- ============================================================================
ALTER TABLE products
    ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    ADD COLUMN slug TEXT,
    ADD COLUMN sku TEXT,
    ADD COLUMN product_url TEXT,
    ADD COLUMN is_active BOOLEAN DEFAULT true,
    ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add unique constraint
ALTER TABLE products ADD CONSTRAINT products_brand_slug_unique UNIQUE(brand_id, slug);

-- Create index for performance
CREATE INDEX idx_products_brand ON products(brand_id);
```

### Competitor Tables

```sql
-- ============================================================================
-- BRAND COMPETITORS
-- ============================================================================
CREATE TABLE brand_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

    competitor_name TEXT NOT NULL,
    competitor_type TEXT CHECK (competitor_type IN ('direct', 'indirect', 'aspirational')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(brand_id, competitor_name)
);

-- ============================================================================
-- PRODUCT COMPETITORS
-- ============================================================================
CREATE TABLE product_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    competitor_product TEXT NOT NULL,
    competitor_brand TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, competitor_product)
);
```

### Visibility Report Tables

```sql
-- ============================================================================
-- BRAND VISIBILITY REPORTS
-- ============================================================================
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
    share_of_voice DECIMAL(5,2),
    competitive_rank INT,

    -- Sentiment
    avg_sentiment_score DECIMAL(3,2),  -- -1 to +1

    -- Recommendation metrics
    recommendation_rate DECIMAL(5,2),
    first_choice_rate DECIMAL(5,2),

    -- Trends
    visibility_change DECIMAL(5,2),
    mentions_change INT,

    -- Sample data (JSONB for flexibility)
    sample_queries JSONB,
    sample_responses JSONB,
    top_strengths JSONB,
    top_weaknesses JSONB,

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(brand_id, report_date, report_period)
);

-- ============================================================================
-- PRODUCT VISIBILITY REPORTS
-- ============================================================================
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
    mentions_as_recommendation INT DEFAULT 0,
    mentions_as_comparison INT DEFAULT 0,
    mentions_as_example INT DEFAULT 0,
    mentions_as_warning INT DEFAULT 0,

    -- Competitive positioning
    competitor_comparisons JSONB,
    category_rank INT,

    -- Query analysis
    top_triggering_queries JSONB,
    query_categories JSONB,

    -- Sentiment
    sentiment_score DECIMAL(3,2),
    sentiment_breakdown JSONB,

    -- Attributes
    attributes_mentioned JSONB,
    positive_attributes JSONB,
    negative_attributes JSONB,

    -- Sample responses
    sample_responses JSONB,

    -- Trends
    visibility_change DECIMAL(5,2),
    rank_change INT,

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, report_date, report_period)
);
```

### Query Logging & Recommendations

```sql
-- ============================================================================
-- VISIBILITY QUERIES (Raw data from AI platforms)
-- ============================================================================
CREATE TABLE visibility_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    -- Query details
    ai_platform TEXT NOT NULL,
    ai_model TEXT,
    query_text TEXT NOT NULL,
    query_category TEXT,

    -- Response
    response_text TEXT,
    response_tokens INT,

    -- Analysis
    product_mentioned BOOLEAN,
    mention_type TEXT,
    mention_position INT,
    sentiment TEXT,
    competitors_mentioned TEXT[],

    queried_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VISIBILITY RECOMMENDATIONS
-- ============================================================================
CREATE TABLE visibility_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    recommendation_type TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT,

    expected_impact TEXT,
    effort_level TEXT CHECK (effort_level IN ('low', 'medium', 'high')),

    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    assigned_to UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes & RLS Policies

```sql
-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_brands_org ON brands(organization_id);
CREATE INDEX idx_brands_category ON brands(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_brand_reports_date ON brand_visibility_reports(brand_id, report_date DESC);
CREATE INDEX idx_product_reports_date ON product_visibility_reports(product_id, report_date DESC);
CREATE INDEX idx_visibility_queries_brand ON visibility_queries(brand_id, queried_at DESC);
CREATE INDEX idx_visibility_queries_product ON visibility_queries(product_id, queried_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_visibility_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_visibility_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_recommendations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users see orgs they belong to
CREATE POLICY "Users see own organizations" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    );

-- Organization members: Users see members of their orgs
CREATE POLICY "Users see org members" ON organization_members
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    );

-- Brands: Users see brands in their orgs
CREATE POLICY "Users see org brands" ON brands
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    );

-- Products: Users see products from brands in their orgs
CREATE POLICY "Users see org products" ON products
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
        OR user_id = auth.uid()  -- Legacy: users see their own products
    );

-- Similar policies for other tables...
```

## 1.2 Data Migration Strategy

```sql
-- Step 1: Create a default organization for existing users
INSERT INTO organizations (id, name, slug, industry)
VALUES ('00000000-0000-0000-0000-000000000001', 'My Organization', 'my-org', 'Beauty & Cosmetics');

-- Step 2: Add existing users as owners
INSERT INTO organization_members (organization_id, user_id, role)
SELECT
    '00000000-0000-0000-0000-000000000001',
    DISTINCT user_id,
    'owner'
FROM products;

-- Step 3: Create a default brand for existing products
INSERT INTO brands (id, organization_id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'My Brand', 'my-brand');

-- Step 4: Link existing products to the default brand
UPDATE products SET brand_id = '00000000-0000-0000-0000-000000000002';

-- Step 5: Generate slugs for existing products
UPDATE products SET slug = LOWER(REPLACE(name, ' ', '-'));
```

---

# Phase 2: Organization & Brand Management

## 2.1 Frontend: Organization Setup Flow

### Page: `/onboarding` (New user flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  cramler.ai                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                     Welcome to Cramler.ai! 👋                               │
│                                                                              │
│         Let's set up your organization to start tracking                    │
│              AI visibility for your brands and products.                    │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Step 1 of 3: Organization Details                                    │  │
│  │                                                                        │  │
│  │  Organization Name *                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ LVMH                                                            │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Industry *                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Luxury Goods                                              ▼     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Website (optional)                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ https://www.lvmh.com                                            │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │                                              ┌──────────────────────┐  │  │
│  │                                              │  Continue →          │  │  │
│  │                                              └──────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                              ● ○ ○                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page: `/onboarding/brand` (Step 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  cramler.ai                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Step 2 of 3: Add Your First Brand                                    │  │
│  │                                                                        │  │
│  │  Brand Name *                                                          │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Dior Beauty                                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Category                                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Perfumes & Cosmetics                                      ▼     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  Market Position                                                       │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │  │
│  │  │ ◉ Luxury     │ │ ○ Premium    │ │ ○ Mass Mkt   │                   │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘                   │  │
│  │                                                                        │  │
│  │  Brand Website (optional)                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ https://www.dior.com/beauty                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐                        ┌──────────────────────┐  │  │
│  │  │  ← Back          │                        │  Continue →          │  │  │
│  │  └──────────────────┘                        └──────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                              ○ ● ○                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Page: `/onboarding/products` (Step 3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  cramler.ai                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Step 3 of 3: Add Products to Track                                   │  │
│  │                                                                        │  │
│  │  Add products from Dior Beauty that you want to monitor.              │  │
│  │  Our AI will research each product and start tracking visibility.     │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Sauvage Eau de Parfum                                    ✕      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Miss Dior Eau de Parfum                                  ✕      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ J'adore                                                  ✕      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │ + Add another product                                           │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  💡 Tip: You can add more products and brands later from             │  │
│  │     the dashboard.                                                    │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐                        ┌──────────────────────┐  │  │
│  │  │  ← Back          │                        │  Start Tracking →    │  │  │
│  │  └──────────────────┘                        └──────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│                              ○ ○ ●                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Frontend: Organization Dashboard

### Page: `/dashboard` (Main landing after login)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   Organization Overview                                              │
│              │                                                                       │
│  🏷️ Brands   │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│              │   │  Overall Score  │ │  Total Brands   │ │ Total Products  │        │
│  📦 Products │   │                 │ │                 │ │                 │        │
│              │   │      72/100     │ │       12        │ │       156       │        │
│  📈 Reports  │   │   ↑ 5% vs last  │ │                 │ │  23 pending     │        │
│              │   └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│  ⚔️ Compete  │                                                                       │
│              │   ┌─────────────────────────────────────────────────────────────┐    │
│  ⚙️ Settings │   │  AI Platform Visibility                                     │    │
│              │   │                                                              │    │
│              │   │  ChatGPT    ████████████████████░░░░░  78/100               │    │
│              │   │  Claude     ███████████████████░░░░░░  75/100               │    │
│              │   │  Perplexity ████████████████░░░░░░░░░  65/100               │    │
│              │   │  Gemini     ██████████████░░░░░░░░░░░  58/100               │    │
│              │   │  Copilot    ████████████░░░░░░░░░░░░░  52/100               │    │
│              │   │                                                              │    │
│              │   └─────────────────────────────────────────────────────────────┘    │
│              │                                                                       │
│              │   Brand Performance                              + Add Brand         │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │ Brand            │ Score  │ Change │ Products │ Status       │   │
│              │   ├──────────────────┼────────┼────────┼──────────┼──────────────┤   │
│              │   │ 🏷️ Dior Beauty   │ 85     │ ↑ +8%  │ 24       │ 🟢 Active    │   │
│              │   │ 🏷️ Louis Vuitton │ 78     │ ↑ +3%  │ 18       │ 🟢 Active    │   │
│              │   │ 🏷️ Guerlain      │ 72     │ ↓ -2%  │ 31       │ 🟢 Active    │   │
│              │   │ 🏷️ Fendi         │ 65     │ ↑ +5%  │ 12       │ 🟢 Active    │   │
│              │   │ 🏷️ Benefit       │ 58     │ —      │ 28       │ 🟡 New       │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Recent Alerts                                                       │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │ ⚠️  Sauvage EDP dropped from #1 to #3 on ChatGPT    2h ago   │   │
│              │   │ ✅  Miss Dior now recommended 40% more often        5h ago   │   │
│              │   │ 📊  Weekly report ready for Dior Beauty             1d ago   │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

## 2.3 Frontend: Brand Management

### Page: `/brands` (Brand list)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   Brands                                         + Add Brand         │
│              │                                                                       │
│ ▶ 🏷️ Brands  │   ┌─────────────────────────────────────────────────────────────┐    │
│              │   │ 🔍 Search brands...                    Category: All ▼      │    │
│  📦 Products │   └─────────────────────────────────────────────────────────────┘    │
│              │                                                                       │
│  📈 Reports  │   ┌─────────────────────────────────────────────────────────────┐    │
│              │   │                                                              │    │
│  ⚔️ Compete  │   │  ┌────────────────────────────────────────────────────────┐ │    │
│              │   │  │ [DIOR LOGO]                                            │ │    │
│  ⚙️ Settings │   │  │                                                        │ │    │
│              │   │  │  Dior Beauty                                           │ │    │
│              │   │  │  Perfumes & Cosmetics • Luxury • 24 products           │ │    │
│              │   │  │                                                        │ │    │
│              │   │  │  Score: 85/100  ↑ +8%     3 competitors tracked        │ │    │
│              │   │  │                                                        │ │    │
│              │   │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │ │    │
│              │   │  │  │ View Brand │ │ Products   │ │ Reports    │          │ │    │
│              │   │  │  └────────────┘ └────────────┘ └────────────┘          │ │    │
│              │   │  └────────────────────────────────────────────────────────┘ │    │
│              │   │                                                              │    │
│              │   │  ┌────────────────────────────────────────────────────────┐ │    │
│              │   │  │ [GUERLAIN LOGO]                                        │ │    │
│              │   │  │                                                        │ │    │
│              │   │  │  Guerlain                                              │ │    │
│              │   │  │  Perfumes & Cosmetics • Luxury • 31 products           │ │    │
│              │   │  │                                                        │ │    │
│              │   │  │  Score: 72/100  ↓ -2%     2 competitors tracked        │ │    │
│              │   │  │                                                        │ │    │
│              │   │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │ │    │
│              │   │  │  │ View Brand │ │ Products   │ │ Reports    │          │ │    │
│              │   │  │  └────────────┘ └────────────┘ └────────────┘          │ │    │
│              │   │  └────────────────────────────────────────────────────────┘ │    │
│              │   │                                                              │    │
│              │   └─────────────────────────────────────────────────────────────┘    │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

### Page: `/brands/[id]` (Brand detail)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   ← Back to Brands                                                   │
│              │                                                                       │
│ ▶ 🏷️ Brands  │   ┌──────────────────────────────────────────────────────────────┐   │
│   └ Dior     │   │  [DIOR LOGO]   Dior Beauty                      ⚙️ Edit      │   │
│              │   │                Perfumes & Cosmetics • Luxury                 │   │
│  📦 Products │   │                www.dior.com/beauty                           │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│  📈 Reports  │                                                                       │
│              │   ┌────────────┬────────────┬────────────┬────────────┐              │
│  ⚔️ Compete  │   │ Overview   │ Products   │ Reports    │ Competitors│              │
│              │   └────────────┴────────────┴────────────┴────────────┘              │
│  ⚙️ Settings │                                                                       │
│              │   Visibility Score                                                    │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │                                                               │   │
│              │   │       85/100                ↑ +8% vs last week               │   │
│              │   │   ┌─────────────┐                                            │   │
│              │   │   │             │                                            │   │
│              │   │   │   🎯  85    │  Recommended 73% of the time               │   │
│              │   │   │             │  First choice 45% of the time              │   │
│              │   │   └─────────────┘                                            │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Platform Performance                                                │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │  ChatGPT     ████████████████████░░░░░  88    ↑ +5          │   │
│              │   │  Claude      ███████████████████░░░░░░  82    ↑ +12         │   │
│              │   │  Perplexity  ████████████████████░░░░░  85    ↑ +3          │   │
│              │   │  Gemini      ████████████████░░░░░░░░░  78    ↓ -2          │   │
│              │   │  Copilot     ██████████████░░░░░░░░░░░  72    —             │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Top Products                                    View All →         │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │ Product              │ Score │ Rank │ Mentions │ Trend       │   │
│              │   ├──────────────────────┼───────┼──────┼──────────┼─────────────┤   │
│              │   │ Sauvage EDP          │ 92    │ #1   │ 847      │ ↑ +15%      │   │
│              │   │ Miss Dior EDP        │ 88    │ #3   │ 623      │ ↑ +8%       │   │
│              │   │ J'adore              │ 85    │ #5   │ 512      │ ↓ -3%       │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

# Phase 3: Product Management Refactor

## 3.1 Updated Product List

### Page: `/products` (All products across brands)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   Products                                       + Add Product       │
│              │                                                                       │
│  🏷️ Brands   │   ┌─────────────────────────────────────────────────────────────┐    │
│              │   │ 🔍 Search products...   Brand: All ▼   Status: All ▼        │    │
│ ▶ 📦 Products│   └─────────────────────────────────────────────────────────────┘    │
│              │                                                                       │
│  📈 Reports  │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │                                                               │   │
│  ⚔️ Compete  │   │ ┌────┐                                                       │   │
│              │   │ │IMG │  Sauvage Eau de Parfum                                │   │
│  ⚙️ Settings │   │ └────┘  Dior Beauty • Men's Fragrance • $150                 │   │
│              │   │         Score: 92/100  #1 in category   🟢 Ready             │   │
│              │   │                                                               │   │
│              │   │ ┌────┐                                                       │   │
│              │   │ │IMG │  Miss Dior Eau de Parfum                              │   │
│              │   │ └────┘  Dior Beauty • Women's Fragrance • $135               │   │
│              │   │         Score: 88/100  #3 in category   🟢 Ready             │   │
│              │   │                                                               │   │
│              │   │ ┌────┐                                                       │   │
│              │   │ │IMG │  Neverfull MM                                         │   │
│              │   │ └────┘  Louis Vuitton • Handbag • $1,960                     │   │
│              │   │         Score: 78/100  #2 in category   🟢 Ready             │   │
│              │   │                                                               │   │
│              │   │ ┌────┐                                                       │   │
│              │   │ │IMG │  Shalimar Eau de Parfum                               │   │
│              │   │ └────┘  Guerlain • Women's Fragrance • $120                  │   │
│              │   │         Score: — Pending                 🟡 Researching       │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Showing 1-10 of 156 products                    ← 1 2 3 ... 16 →   │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

## 3.2 Updated Product Detail

### Page: `/products/[id]` (Product with visibility data)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   ← Dior Beauty / Products                                           │
│              │                                                                       │
│  🏷️ Brands   │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │  ┌────────┐                                                   │   │
│ ▶ 📦 Products│   │  │        │   Sauvage Eau de Parfum               ⚙️ Edit    │   │
│   └ Sauvage  │   │  │  IMG   │   Dior Beauty • Men's Fragrance                  │   │
│              │   │  │        │   $150 • 100ml                                   │   │
│  📈 Reports  │   │  └────────┘                                                   │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│  ⚔️ Compete  │                                                                       │
│              │   ┌────────────┬────────────┬────────────┬────────────┐              │
│  ⚙️ Settings │   │ Visibility │ Details    │ Competitors│ Reports    │              │
│              │   └────────────┴────────────┴────────────┴────────────┘              │
│              │                                                                       │
│              │   AI Visibility Score                                                 │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │                                                               │   │
│              │   │   ┌─────────────────────────────────────────────────────────┐│   │
│              │   │   │      92/100           #1 in Men's Luxury Fragrances    ││   │
│              │   │   │                                                         ││   │
│              │   │   │  📈 Trend: ↑ +15% vs last week                         ││   │
│              │   │   │  🎯 Recommended: 78% of relevant queries               ││   │
│              │   │   │  🥇 First Choice: 52% of recommendations               ││   │
│              │   │   └─────────────────────────────────────────────────────────┘│   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Platform Breakdown                                                  │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │                                                               │   │
│              │   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │   │
│              │   │  │   ChatGPT    │ │    Claude    │ │  Perplexity  │          │   │
│              │   │  │     95       │ │     90       │ │     92       │          │   │
│              │   │  │   ↑ +8       │ │   ↑ +15      │ │   ↑ +5       │          │   │
│              │   │  │   234 ment.  │ │   189 ment.  │ │   156 ment.  │          │   │
│              │   │  └──────────────┘ └──────────────┘ └──────────────┘          │   │
│              │   │                                                               │   │
│              │   │  ┌──────────────┐ ┌──────────────┐                           │   │
│              │   │  │    Gemini    │ │   Copilot    │                           │   │
│              │   │  │     88       │ │     85       │                           │   │
│              │   │  │   ↓ -2       │ │   —          │                           │   │
│              │   │  │   145 ment.  │ │   123 ment.  │                           │   │
│              │   │  └──────────────┘ └──────────────┘                           │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Competitive Position                                                │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │  vs Bleu de Chanel:     Wins 62% of comparisons   ✅         │   │
│              │   │  vs Y by YSL:           Wins 71% of comparisons   ✅         │   │
│              │   │  vs Acqua di Gio:       Wins 58% of comparisons   ✅         │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   What AI Says About This Product                                     │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │                                                               │   │
│              │   │  ✅ Strengths                    ⚠️ Weaknesses               │   │
│              │   │  • Long-lasting scent            • Premium price point       │   │
│              │   │  • Versatile for occasions       • Some find it too strong   │   │
│              │   │  • Modern masculine appeal       • Common/overused           │   │
│              │   │  • Quality ingredients                                       │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Top Queries Triggering Mentions                                     │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │  "best men's cologne 2024"                    234 mentions   │   │
│              │   │  "long lasting men's fragrance"               189 mentions   │   │
│              │   │  "gift for boyfriend cologne"                 156 mentions   │   │
│              │   │  "sauvage vs bleu de chanel"                  145 mentions   │   │
│              │   │  "dior fragrance recommendation"              123 mentions   │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

# Phase 4: Visibility Monitoring Engine

## 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           VISIBILITY MONITORING ENGINE                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                            SCHEDULER (n8n or Cron)                            │   │
│  │                                                                                │   │
│  │   Daily:  Run visibility checks for all active products                       │   │
│  │   Weekly: Generate weekly reports                                             │   │
│  │   Monthly: Generate monthly reports                                           │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         QUERY GENERATOR                                       │   │
│  │                                                                                │   │
│  │   For each product/brand, generate relevant queries:                          │   │
│  │   • "best [category] 2024"                                                    │   │
│  │   • "[product name] review"                                                   │   │
│  │   • "[product] vs [competitor]"                                               │   │
│  │   • "recommend [category] for [use case]"                                     │   │
│  │   • "[brand] products worth buying"                                           │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         AI PLATFORM QUERIERS                                  │   │
│  │                                                                                │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │   │
│  │  │  ChatGPT   │ │   Claude   │ │ Perplexity │ │   Gemini   │ │  Copilot   │  │   │
│  │  │   API      │ │    API     │ │    API     │ │    API     │ │    API     │  │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘  │   │
│  │                                                                                │   │
│  │   Each querier:                                                                │   │
│  │   1. Sends query to AI platform                                               │   │
│  │   2. Receives response                                                        │   │
│  │   3. Logs raw data to visibility_queries table                                │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         RESPONSE ANALYZER                                     │   │
│  │                                                                                │   │
│  │   For each response:                                                          │   │
│  │   • Check if product/brand is mentioned                                       │   │
│  │   • Determine mention type (recommendation, comparison, warning)              │   │
│  │   • Calculate mention position (1st, 2nd, 3rd choice)                         │   │
│  │   • Analyze sentiment (positive, neutral, negative)                           │   │
│  │   • Extract competitors mentioned                                             │   │
│  │   • Identify attributes discussed                                             │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         SCORE CALCULATOR                                      │   │
│  │                                                                                │   │
│  │   Calculate visibility scores:                                                │   │
│  │   • Platform-specific scores (0-100)                                          │   │
│  │   • Overall visibility score (weighted average)                               │   │
│  │   • Share of voice (vs competitors)                                           │   │
│  │   • Category rank                                                             │   │
│  │   • Recommendation rate                                                       │   │
│  │   • First choice rate                                                         │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│                                      ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         REPORT GENERATOR                                      │   │
│  │                                                                                │   │
│  │   Generate reports:                                                           │   │
│  │   • product_visibility_reports (per product, daily)                           │   │
│  │   • brand_visibility_reports (aggregate, daily/weekly/monthly)                │   │
│  │   • visibility_recommendations (actionable insights)                          │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 CrewAI Agent for Visibility Analysis

```python
# agents/visibility_crew.py

from crewai import Agent, Task, Crew, Process
from crewai.tools import tool

@tool
def query_chatgpt(query: str) -> str:
    """Query ChatGPT and return the response."""
    # Implementation with OpenAI API
    pass

@tool
def query_claude(query: str) -> str:
    """Query Claude and return the response."""
    # Implementation with Anthropic API
    pass

@tool
def query_perplexity(query: str) -> str:
    """Query Perplexity and return the response."""
    # Implementation with Perplexity API
    pass

def create_visibility_crew(product_name: str, brand_name: str, competitors: list) -> Crew:
    """Create a crew for visibility analysis."""

    # Query Generator Agent
    query_generator = Agent(
        role="Query Strategist",
        goal=f"Generate effective queries to test visibility of {product_name} by {brand_name}",
        backstory="Expert in understanding how users search for products in AI platforms."
    )

    # AI Platform Querier Agent
    querier = Agent(
        role="AI Platform Analyst",
        goal="Query multiple AI platforms and collect responses",
        tools=[query_chatgpt, query_claude, query_perplexity]
    )

    # Response Analyzer Agent
    analyzer = Agent(
        role="Response Analyst",
        goal="Analyze AI responses for mentions, sentiment, and positioning",
        backstory="Expert in NLP and sentiment analysis."
    )

    # Tasks...
    # Crew setup...
```

---

# Phase 5: Reports & Analytics Dashboard

## 5.1 Reports Page

### Page: `/reports` (Reports overview)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   Reports                                                             │
│              │                                                                       │
│  🏷️ Brands   │   ┌────────────────────────────────────────────────────────────────┐  │
│              │   │  Time Period:  │ Last 7 Days ▼ │  │ This Month │ │ Custom │   │  │
│  📦 Products │   └────────────────────────────────────────────────────────────────┘  │
│              │                                                                       │
│ ▶ 📈 Reports │   Organization Summary                                                │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│  ⚔️ Compete  │   │                                                               │   │
│              │   │   Overall Visibility         Share of Voice                   │   │
│  ⚙️ Settings │   │   ┌───────────────────┐     ┌───────────────────┐            │   │
│              │   │   │       72/100      │     │       23%         │            │   │
│              │   │   │     ↑ +5% WoW     │     │   vs 28% Chanel   │            │   │
│              │   │   └───────────────────┘     └───────────────────┘            │   │
│              │   │                                                               │   │
│              │   │   ┌─────────────────────────────────────────────────────┐    │   │
│              │   │   │  Visibility Trend (Last 30 Days)                    │    │   │
│              │   │   │                                                      │    │   │
│              │   │   │  80 ┤                              ╭──────           │    │   │
│              │   │   │  70 ┤              ╭───────────────╯                 │    │   │
│              │   │   │  60 ┤  ────────────╯                                 │    │   │
│              │   │   │  50 ┤                                                │    │   │
│              │   │   │     └────┬────┬────┬────┬────┬────┬────┬────┬────   │    │   │
│              │   │   │         W1   W2   W3   W4   W5   W6   W7   W8       │    │   │
│              │   │   │                                                      │    │   │
│              │   │   │   ── LVMH   ── Chanel   ── Estée Lauder             │    │   │
│              │   │   └─────────────────────────────────────────────────────┘    │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Brand Reports                                                       │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │ Brand            │ Score │ Change │ Top Product   │ Action   │   │
│              │   ├──────────────────┼───────┼────────┼───────────────┼──────────┤   │
│              │   │ Dior Beauty      │ 85    │ ↑ +8%  │ Sauvage (92)  │ View →   │   │
│              │   │ Louis Vuitton    │ 78    │ ↑ +3%  │ Neverfull(78) │ View →   │   │
│              │   │ Guerlain         │ 72    │ ↓ -2%  │ Shalimar (75) │ View →   │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Export Options                                                      │
│              │   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│              │   │ 📄 PDF Report │ │ 📊 Excel      │ │ 📧 Email      │              │
│              │   └───────────────┘ └───────────────┘ └───────────────┘              │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

# Phase 6: Competitor Tracking

## 6.1 Competitor Management

### Page: `/competitors` (Competitor tracking)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   Competitor Tracking                            + Add Competitor    │
│              │                                                                       │
│  🏷️ Brands   │   Dior Beauty Competitors                                            │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│  📦 Products │   │                                                               │   │
│              │   │  ┌────────────────────────────────────────────────────────┐  │   │
│  📈 Reports  │   │  │  Chanel                                    Direct      │  │   │
│              │   │  │                                                        │  │   │
│ ▶ ⚔️ Compete │   │  │  Share of Voice: 28% (vs your 23%)                     │  │   │
│              │   │  │  Products Tracked: Bleu de Chanel, No. 5, Coco        │  │   │
│  ⚙️ Settings │   │  │                                                        │  │   │
│              │   │  │  Head-to-Head: You win 45% of comparisons              │  │   │
│              │   │  │                                                        │  │   │
│              │   │  │  ┌─────────────┐ ┌─────────────┐                       │  │   │
│              │   │  │  │ View Detail │ │ Comparison  │                       │  │   │
│              │   │  │  └─────────────┘ └─────────────┘                       │  │   │
│              │   │  └────────────────────────────────────────────────────────┘  │   │
│              │   │                                                               │   │
│              │   │  ┌────────────────────────────────────────────────────────┐  │   │
│              │   │  │  Yves Saint Laurent                        Direct      │  │   │
│              │   │  │                                                        │  │   │
│              │   │  │  Share of Voice: 18% (vs your 23%)                     │  │   │
│              │   │  │  Products Tracked: Y EDP, Black Opium, Libre          │  │   │
│              │   │  │                                                        │  │   │
│              │   │  │  Head-to-Head: You win 62% of comparisons              │  │   │
│              │   │  │                                                        │  │   │
│              │   │  │  ┌─────────────┐ ┌─────────────┐                       │  │   │
│              │   │  │  │ View Detail │ │ Comparison  │                       │  │   │
│              │   │  │  └─────────────┘ └─────────────┘                       │  │   │
│              │   │  └────────────────────────────────────────────────────────┘  │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Share of Voice Breakdown                                            │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │                                                               │   │
│              │   │   ┌──────────────────────────────────────────────────────┐   │   │
│              │   │   │  Chanel        ████████████████████████████  28%     │   │   │
│              │   │   │  Dior (You)    ███████████████████████  23%          │   │   │
│              │   │   │  YSL           ██████████████████  18%               │   │   │
│              │   │   │  Tom Ford      ████████████████  16%                 │   │   │
│              │   │   │  Others        ███████████████  15%                  │   │   │
│              │   │   └──────────────────────────────────────────────────────┘   │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

# Phase 7: Recommendations & Insights

## 7.1 Recommendations Dashboard

### Page: `/recommendations` (AI-generated recommendations)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                          │
│ │ cramler │  LVMH                                            🔔  👤 Marie ▼         │
│ └─────────┘                                                                          │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│              │                                                                       │
│  📊 Dashboard│   Recommendations                                                     │
│              │                                                                       │
│  🏷️ Brands   │   ┌────────────────────────────────────────────────────────────────┐  │
│              │   │  Filter:  All ▼  │  Priority: All ▼  │  Status: Open ▼        │  │
│  📦 Products │   └────────────────────────────────────────────────────────────────┘  │
│              │                                                                       │
│  📈 Reports  │   High Priority                                                       │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│  ⚔️ Compete  │   │                                                               │   │
│              │   │  🔴 Update Sauvage Product Description                        │   │
│ ▶ 💡 Insights│   │     Dior Beauty / Sauvage EDP                                │   │
│              │   │                                                               │   │
│  ⚙️ Settings │   │     AI platforms are not mentioning the new 2024 formula     │   │
│              │   │     update. Updating your product description to highlight   │   │
│              │   │     this could improve recommendations by 15%.               │   │
│              │   │                                                               │   │
│              │   │     Expected Impact: +15% visibility                         │   │
│              │   │     Effort: Low                                              │   │
│              │   │                                                               │   │
│              │   │     ┌──────────┐ ┌──────────┐ ┌──────────┐                   │   │
│              │   │     │ Start    │ │ Dismiss  │ │ Details  │                   │   │
│              │   │     └──────────┘ └──────────┘ └──────────┘                   │   │
│              │   │                                                               │   │
│              │   │  ─────────────────────────────────────────────────────────   │   │
│              │   │                                                               │   │
│              │   │  🔴 Add Competitor Comparison Content                         │   │
│              │   │     Dior Beauty / Miss Dior EDP                              │   │
│              │   │                                                               │   │
│              │   │     AI platforms often compare Miss Dior unfavorably to       │   │
│              │   │     Coco Mademoiselle. Creating comparison content could     │   │
│              │   │     help AI understand your product's unique value.          │   │
│              │   │                                                               │   │
│              │   │     Expected Impact: +10% in comparisons                     │   │
│              │   │     Effort: Medium                                           │   │
│              │   │                                                               │   │
│              │   │     ┌──────────┐ ┌──────────┐ ┌──────────┐                   │   │
│              │   │     │ Start    │ │ Dismiss  │ │ Details  │                   │   │
│              │   │     └──────────┘ └──────────┘ └──────────┘                   │   │
│              │   │                                                               │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
│              │   Medium Priority                                                     │
│              │   ┌──────────────────────────────────────────────────────────────┐   │
│              │   │  🟡 Improve ingredient transparency for J'adore              │   │
│              │   │  🟡 Add more user reviews to Louis Vuitton Neverfull        │   │
│              │   │  🟡 Update Guerlain Shalimar for younger audience           │   │
│              │   └──────────────────────────────────────────────────────────────┘   │
│              │                                                                       │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

# Implementation Checklist

## Phase 1: Database ✅
- [ ] Create organizations table
- [ ] Create organization_members table
- [ ] Create categories table
- [ ] Create brands table
- [ ] Update products table (add brand_id, slug, etc.)
- [ ] Create brand_competitors table
- [ ] Create product_competitors table
- [ ] Create brand_visibility_reports table
- [ ] Create product_visibility_reports table
- [ ] Create visibility_queries table
- [ ] Create visibility_recommendations table
- [ ] Add indexes
- [ ] Set up RLS policies
- [ ] Migrate existing data

## Phase 2: Organization & Brand Management
- [ ] Create onboarding flow (3 steps)
- [ ] Create organization dashboard
- [ ] Create brand list page
- [ ] Create brand detail page
- [ ] Create add brand modal
- [ ] Update sidebar navigation
- [ ] Add organization context/provider

## Phase 3: Product Management
- [ ] Update product list (show brand, score)
- [ ] Update product detail (add visibility tab)
- [ ] Create add product flow (select brand first)
- [ ] Update CrewAI agent to save with brand_id

## Phase 4: Visibility Monitoring Engine
- [ ] Create visibility_crew.py (CrewAI agent)
- [ ] Set up API integrations (ChatGPT, Claude, Perplexity, Gemini, Copilot)
- [ ] Create query generator
- [ ] Create response analyzer
- [ ] Create score calculator
- [ ] Set up scheduling (n8n or cron)
- [ ] Create visibility monitoring n8n workflow

## Phase 5: Reports & Analytics
- [ ] Create reports overview page
- [ ] Create brand report detail page
- [ ] Create product report detail page
- [ ] Add export functionality (PDF, Excel)
- [ ] Add email report scheduling

## Phase 6: Competitor Tracking
- [ ] Create competitor list page
- [ ] Create add competitor flow
- [ ] Create comparison view
- [ ] Add share of voice calculations
- [ ] Add head-to-head analysis

## Phase 7: Recommendations
- [ ] Create recommendations page
- [ ] Implement recommendation generation logic
- [ ] Add recommendation status tracking
- [ ] Add assignment functionality

---

# Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 + Tailwind + shadcn/ui |
| Backend | Supabase (Database + Auth + Edge Functions) |
| AI Agents | CrewAI + FastAPI (Docker) |
| Workflow | n8n |
| Real-time | WebSocket |
| AI Platforms | OpenAI, Anthropic, Perplexity, Google, Microsoft APIs |

---

*This plan will be updated as implementation progresses.*
