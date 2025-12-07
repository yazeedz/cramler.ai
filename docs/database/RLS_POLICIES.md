# Row Level Security (RLS) Policies

## Overview

All tables use Row Level Security to ensure multi-tenant data isolation. Users can only access data belonging to organizations they are members of.

---

## Enable RLS on All Tables

```sql
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
-- products already has RLS enabled
```

---

## Policy Definitions

### 1. organizations

```sql
-- Users can see organizations they belong to
CREATE POLICY "Users see own organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Only owners can update organization
CREATE POLICY "Owners can update organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Only owners can delete organization
CREATE POLICY "Owners can delete organization" ON organizations
    FOR DELETE USING (
        id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Any authenticated user can create an organization
CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

---

### 2. organization_members

```sql
-- Users can see members of their organizations
CREATE POLICY "Users see org members" ON organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Admins and owners can add members
CREATE POLICY "Admins can add members" ON organization_members
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Admins and owners can update member roles
CREATE POLICY "Admins can update members" ON organization_members
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Admins and owners can remove members
CREATE POLICY "Admins can remove members" ON organization_members
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
```

---

### 3. categories

```sql
-- Users can see categories in their organizations
CREATE POLICY "Users see org categories" ON categories
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Managers+ can create categories
CREATE POLICY "Managers can create categories" ON categories
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Managers+ can update categories
CREATE POLICY "Managers can update categories" ON categories
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Managers+ can delete categories
CREATE POLICY "Managers can delete categories" ON categories
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );
```

---

### 4. brands

```sql
-- Users can see brands in their organizations
CREATE POLICY "Users see org brands" ON brands
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Managers+ can create brands
CREATE POLICY "Managers can create brands" ON brands
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Managers+ can update brands
CREATE POLICY "Managers can update brands" ON brands
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Admins+ can delete brands
CREATE POLICY "Admins can delete brands" ON brands
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id
            FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
```

---

### 5. products

```sql
-- Users can see products from brands in their organizations
-- Also keep legacy access for user's own products
CREATE POLICY "Users see org products" ON products
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
        OR user_id = auth.uid()  -- Legacy: users see their own products
    );

-- Managers+ can create products
CREATE POLICY "Managers can create products" ON products
    FOR INSERT WITH CHECK (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
            )
        )
    );

-- Managers+ can update products
CREATE POLICY "Managers can update products" ON products
    FOR UPDATE USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
            )
        )
    );

-- Admins+ can delete products
CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
            )
        )
    );
```

---

### 6. brand_competitors

```sql
-- Users can see competitors for brands in their orgs
CREATE POLICY "Users see brand competitors" ON brand_competitors
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Managers+ can manage competitors
CREATE POLICY "Managers can manage brand competitors" ON brand_competitors
    FOR ALL USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
            )
        )
    );
```

---

### 7. product_competitors

```sql
-- Users can see competitors for products in their orgs
CREATE POLICY "Users see product competitors" ON product_competitors
    FOR SELECT USING (
        product_id IN (
            SELECT p.id FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Managers+ can manage product competitors
CREATE POLICY "Managers can manage product competitors" ON product_competitors
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
            )
        )
    );
```

---

### 8. Visibility Reports

```sql
-- Brand visibility reports
CREATE POLICY "Users see brand reports" ON brand_visibility_reports
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Product visibility reports
CREATE POLICY "Users see product reports" ON product_visibility_reports
    FOR SELECT USING (
        product_id IN (
            SELECT p.id FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Note: Reports are generated by system, not users
-- Service role bypasses RLS for inserting reports
```

---

### 9. visibility_queries

```sql
-- Users can see queries for their org's brands/products
CREATE POLICY "Users see visibility queries" ON visibility_queries
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
        OR product_id IN (
            SELECT p.id FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Queries are inserted by system (service role)
```

---

### 10. visibility_recommendations

```sql
-- Users can see recommendations for their org
CREATE POLICY "Users see recommendations" ON visibility_recommendations
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
        OR product_id IN (
            SELECT p.id FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.organization_id IN (
                SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
            )
        )
    );

-- Managers+ can update recommendation status
CREATE POLICY "Managers can update recommendations" ON visibility_recommendations
    FOR UPDATE USING (
        brand_id IN (
            SELECT id FROM brands WHERE organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
            )
        )
        OR product_id IN (
            SELECT p.id FROM products p
            JOIN brands b ON p.brand_id = b.id
            WHERE b.organization_id IN (
                SELECT organization_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
            )
        )
    );
```

---

## Role Permission Summary

| Table | Viewer | Analyst | Manager | Admin | Owner |
|-------|--------|---------|---------|-------|-------|
| organizations | Read | Read | Read | Read/Update | Full |
| organization_members | Read | Read | Read | Full | Full |
| categories | Read | Read | Full | Full | Full |
| brands | Read | Read | Create/Update | Full | Full |
| products | Read | Read | Create/Update | Full | Full |
| brand_competitors | Read | Read | Full | Full | Full |
| product_competitors | Read | Read | Full | Full | Full |
| visibility_reports | Read | Read | Read | Read | Read |
| visibility_queries | Read | Read | Read | Read | Read |
| recommendations | Read | Read | Update | Update | Update |

---

## Service Role Access

The service role (used by Edge Functions and backend processes) bypasses RLS and has full access. This is used for:

- Inserting visibility reports
- Inserting visibility queries
- Generating recommendations
- Updating product data from AI agents

---

## See Also

- [Schema Overview](SCHEMA.md)
- [Table Definitions](TABLES.md)
- [Migrations](MIGRATIONS.md)
