# Phase 1: Database Schema & Migration

## Overview

Create the multi-tenant database structure and migrate existing data.

**Priority:** Critical
**Dependencies:** None

---

## Checklist

### Tables to Create

- [ ] `organizations` - Top-level tenant
- [ ] `organization_members` - User-org membership with roles
- [ ] `categories` - Optional brand grouping
- [ ] `brands` - Brand entities
- [ ] `brand_competitors` - Brand-level competitors
- [ ] `product_competitors` - Product-level competitors
- [ ] `brand_visibility_reports` - Brand visibility scores
- [ ] `product_visibility_reports` - Product visibility scores
- [ ] `visibility_queries` - Raw AI query logs
- [ ] `visibility_recommendations` - AI-generated suggestions

### Products Table Updates

- [ ] Add `brand_id` column
- [ ] Add `slug` column
- [ ] Add `sku` column
- [ ] Add `product_url` column
- [ ] Add `is_active` column
- [ ] Add `created_by` column
- [ ] Add unique constraint on `(brand_id, slug)`

### Indexes

- [ ] `idx_org_members_user`
- [ ] `idx_org_members_org`
- [ ] `idx_brands_org`
- [ ] `idx_brands_category`
- [ ] `idx_products_brand`
- [ ] `idx_brand_reports_date`
- [ ] `idx_product_reports_date`
- [ ] `idx_visibility_queries_brand`
- [ ] `idx_visibility_queries_product`

### RLS Policies

- [ ] Organizations policies
- [ ] Organization members policies
- [ ] Categories policies
- [ ] Brands policies
- [ ] Products policies (update existing)
- [ ] Competitors policies
- [ ] Reports policies
- [ ] Queries policies
- [ ] Recommendations policies

### Data Migration

- [ ] Create default organization
- [ ] Add existing users as owners
- [ ] Create default brand
- [ ] Link existing products to brand
- [ ] Generate slugs for products
- [ ] Verify migration success

---

## Implementation Steps

### Step 1: Create Core Tables

Run migration in Supabase SQL Editor:

```sql
-- See database/TABLES.md for full SQL
```

### Step 2: Update Products Table

```sql
ALTER TABLE products
    ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    ADD COLUMN slug TEXT,
    ADD COLUMN sku TEXT,
    ADD COLUMN product_url TEXT,
    ADD COLUMN is_active BOOLEAN DEFAULT true,
    ADD COLUMN created_by UUID REFERENCES auth.users(id);
```

### Step 3: Create Indexes

```sql
-- See database/TABLES.md for full SQL
```

### Step 4: Enable RLS and Create Policies

```sql
-- See database/RLS_POLICIES.md for full SQL
```

### Step 5: Migrate Existing Data

```sql
-- See database/MIGRATIONS.md for full SQL
```

### Step 6: Verify Migration

```sql
-- Check organization created
SELECT * FROM organizations;

-- Check members created
SELECT * FROM organization_members;

-- Check products linked
SELECT COUNT(*) as total, COUNT(brand_id) as with_brand FROM products;
```

---

## Rollback Plan

If migration fails:

```sql
-- Remove new columns from products
ALTER TABLE products
    DROP COLUMN IF EXISTS brand_id,
    DROP COLUMN IF EXISTS slug,
    -- ... etc

-- Drop new tables in reverse order
DROP TABLE IF EXISTS visibility_recommendations;
DROP TABLE IF EXISTS visibility_queries;
-- ... etc
```

---

## Testing

### Verify RLS Works

```sql
-- As authenticated user, should only see own org
SELECT * FROM organizations;

-- Should only see brands in own org
SELECT * FROM brands;

-- Should only see products in own org's brands
SELECT * FROM products;
```

### Verify Foreign Keys

```sql
-- Should fail (invalid org)
INSERT INTO brands (organization_id, name, slug)
VALUES ('invalid-uuid', 'Test', 'test');

-- Should cascade delete
DELETE FROM organizations WHERE id = 'test-org-id';
-- Brands and products should be deleted
```

---

## Next Phase

After completing Phase 1, proceed to [Phase 2: Organization & Brand Management](PHASE_2_ORG_BRANDS.md).

---

## See Also

- [Database Schema](../database/SCHEMA.md)
- [Table Definitions](../database/TABLES.md)
- [RLS Policies](../database/RLS_POLICIES.md)
- [Migrations](../database/MIGRATIONS.md)
