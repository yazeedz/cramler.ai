# Database Migrations

## Overview

This document outlines the migration strategy for transforming the existing single-table product database into a full multi-tenant organization structure.

---

## Pre-Migration Checklist

- [ ] Backup existing database
- [ ] Document existing product count and user count
- [ ] Test migrations on a branch database first
- [ ] Coordinate with any running workflows (pause n8n)

---

## Migration Order

Migrations must be applied in this order due to foreign key dependencies:

1. Create organizations table
2. Create organization_members table
3. Create categories table
4. Create brands table
5. Alter products table (add brand_id, etc.)
6. Create competitor tables
7. Create visibility report tables
8. Create query and recommendation tables
9. Create indexes
10. Apply RLS policies
11. Migrate existing data

---

## Migration 1: Organizations

```sql
-- 001_create_organizations.sql

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

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

---

## Migration 2: Organization Members

```sql
-- 002_create_organization_members.sql

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

-- Indexes
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
```

---

## Migration 3: Categories

```sql
-- 003_create_categories.sql

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

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
```

---

## Migration 4: Brands

```sql
-- 004_create_brands.sql

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website TEXT,

    founded_year INT,
    headquarters TEXT,
    market_position TEXT,

    is_active BOOLEAN DEFAULT true,
    track_competitors BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);

-- Indexes
CREATE INDEX idx_brands_org ON brands(organization_id);
CREATE INDEX idx_brands_category ON brands(category_id);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
```

---

## Migration 5: Alter Products

```sql
-- 005_alter_products.sql

-- Add new columns
ALTER TABLE products
    ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    ADD COLUMN slug TEXT,
    ADD COLUMN sku TEXT,
    ADD COLUMN product_url TEXT,
    ADD COLUMN is_active BOOLEAN DEFAULT true,
    ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add index
CREATE INDEX idx_products_brand ON products(brand_id);
```

---

## Migration 6: Competitor Tables

```sql
-- 006_create_competitors.sql

-- Brand competitors
CREATE TABLE brand_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

    competitor_name TEXT NOT NULL,
    competitor_type TEXT CHECK (competitor_type IN ('direct', 'indirect', 'aspirational')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(brand_id, competitor_name)
);

-- Product competitors
CREATE TABLE product_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    competitor_product TEXT NOT NULL,
    competitor_brand TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, competitor_product)
);

-- Enable RLS
ALTER TABLE brand_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_competitors ENABLE ROW LEVEL SECURITY;
```

---

## Migration 7: Visibility Reports

```sql
-- 007_create_visibility_reports.sql

-- Brand visibility reports
CREATE TABLE brand_visibility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,

    report_date DATE NOT NULL,
    report_period TEXT DEFAULT 'daily' CHECK (report_period IN ('daily', 'weekly', 'monthly')),

    overall_visibility_score DECIMAL(5,2),

    chatgpt_score DECIMAL(5,2),
    claude_score DECIMAL(5,2),
    perplexity_score DECIMAL(5,2),
    gemini_score DECIMAL(5,2),
    copilot_score DECIMAL(5,2),

    total_mentions INT DEFAULT 0,
    positive_mentions INT DEFAULT 0,
    neutral_mentions INT DEFAULT 0,
    negative_mentions INT DEFAULT 0,

    share_of_voice DECIMAL(5,2),
    competitive_rank INT,

    avg_sentiment_score DECIMAL(3,2),

    recommendation_rate DECIMAL(5,2),
    first_choice_rate DECIMAL(5,2),

    visibility_change DECIMAL(5,2),
    mentions_change INT,

    sample_queries JSONB,
    sample_responses JSONB,
    top_strengths JSONB,
    top_weaknesses JSONB,

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(brand_id, report_date, report_period)
);

-- Product visibility reports
CREATE TABLE product_visibility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    report_date DATE NOT NULL,
    report_period TEXT DEFAULT 'daily',

    overall_visibility_score DECIMAL(5,2),

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

    total_mentions INT DEFAULT 0,
    mentions_as_recommendation INT DEFAULT 0,
    mentions_as_comparison INT DEFAULT 0,
    mentions_as_example INT DEFAULT 0,
    mentions_as_warning INT DEFAULT 0,

    competitor_comparisons JSONB,
    category_rank INT,

    top_triggering_queries JSONB,
    query_categories JSONB,

    sentiment_score DECIMAL(3,2),
    sentiment_breakdown JSONB,

    attributes_mentioned JSONB,
    positive_attributes JSONB,
    negative_attributes JSONB,

    sample_responses JSONB,

    visibility_change DECIMAL(5,2),
    rank_change INT,

    generated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(product_id, report_date, report_period)
);

-- Indexes
CREATE INDEX idx_brand_reports_date ON brand_visibility_reports(brand_id, report_date DESC);
CREATE INDEX idx_product_reports_date ON product_visibility_reports(product_id, report_date DESC);

-- Enable RLS
ALTER TABLE brand_visibility_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_visibility_reports ENABLE ROW LEVEL SECURITY;
```

---

## Migration 8: Queries and Recommendations

```sql
-- 008_create_queries_recommendations.sql

-- Visibility queries
CREATE TABLE visibility_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,

    ai_platform TEXT NOT NULL,
    ai_model TEXT,
    query_text TEXT NOT NULL,
    query_category TEXT,

    response_text TEXT,
    response_tokens INT,

    product_mentioned BOOLEAN,
    mention_type TEXT,
    mention_position INT,
    sentiment TEXT,
    competitors_mentioned TEXT[],

    queried_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visibility recommendations
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

-- Indexes
CREATE INDEX idx_visibility_queries_brand ON visibility_queries(brand_id, queried_at DESC);
CREATE INDEX idx_visibility_queries_product ON visibility_queries(product_id, queried_at DESC);

-- Enable RLS
ALTER TABLE visibility_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visibility_recommendations ENABLE ROW LEVEL SECURITY;
```

---

## Migration 9: RLS Policies

See [RLS_POLICIES.md](RLS_POLICIES.md) for complete policy definitions.

```sql
-- 009_apply_rls_policies.sql

-- Apply all RLS policies as defined in RLS_POLICIES.md
-- (Include full policy SQL here)
```

---

## Migration 10: Data Migration

```sql
-- 010_migrate_existing_data.sql

-- Step 1: Get distinct users who have products
-- and create a default organization for each

-- For simplicity, create ONE default organization for all existing users
INSERT INTO organizations (id, name, slug, industry)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'My Organization',
    'my-organization',
    'Beauty & Cosmetics'
);

-- Step 2: Add all existing product owners as organization owners
INSERT INTO organization_members (organization_id, user_id, role, accepted_at)
SELECT DISTINCT
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_id,
    'owner',
    NOW()
FROM products
WHERE user_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Step 3: Create a default brand
INSERT INTO brands (id, organization_id, name, slug)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'My Brand',
    'my-brand'
);

-- Step 4: Link all existing products to the default brand
UPDATE products
SET
    brand_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')),
    created_by = user_id
WHERE brand_id IS NULL;

-- Step 5: Add unique constraint after data migration
ALTER TABLE products
ADD CONSTRAINT products_brand_slug_unique UNIQUE(brand_id, slug);
```

---

## Rollback Scripts

### Rollback Migration 10

```sql
-- rollback_010.sql

-- Remove constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_brand_slug_unique;

-- Clear brand_id from products
UPDATE products SET brand_id = NULL, slug = NULL, created_by = NULL;

-- Delete default brand
DELETE FROM brands WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Delete organization members
DELETE FROM organization_members WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Delete default organization
DELETE FROM organizations WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
```

### Full Rollback (Drop All New Tables)

```sql
-- rollback_all.sql

-- Drop new tables in reverse order
DROP TABLE IF EXISTS visibility_recommendations;
DROP TABLE IF EXISTS visibility_queries;
DROP TABLE IF EXISTS product_visibility_reports;
DROP TABLE IF EXISTS brand_visibility_reports;
DROP TABLE IF EXISTS product_competitors;
DROP TABLE IF EXISTS brand_competitors;

-- Remove new columns from products
ALTER TABLE products
    DROP COLUMN IF EXISTS brand_id,
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS sku,
    DROP COLUMN IF EXISTS product_url,
    DROP COLUMN IF EXISTS is_active,
    DROP COLUMN IF EXISTS created_by;

DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
```

---

## Post-Migration Verification

```sql
-- Verify organization created
SELECT * FROM organizations;

-- Verify members created
SELECT om.*, u.email
FROM organization_members om
JOIN auth.users u ON om.user_id = u.id;

-- Verify brand created
SELECT * FROM brands;

-- Verify products linked
SELECT COUNT(*) as total, COUNT(brand_id) as with_brand
FROM products;

-- Verify all products have brand_id
SELECT id, name, brand_id, slug
FROM products
WHERE brand_id IS NULL;
```

---

## See Also

- [Schema Overview](SCHEMA.md)
- [Table Definitions](TABLES.md)
- [RLS Policies](RLS_POLICIES.md)
