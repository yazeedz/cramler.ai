# Database Schema Overview

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  ENTITY RELATIONSHIPS                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐     │
│  │   auth.users     │────────▶│ organization_    │◀────────│  organizations   │     │
│  │   (Supabase)     │         │    members       │         │                  │     │
│  └──────────────────┘         └──────────────────┘         └────────┬─────────┘     │
│          │                                                          │               │
│          │                                                          │               │
│          │                    ┌──────────────────┐                  │               │
│          │                    │    categories    │◀─────────────────┤               │
│          │                    └────────┬─────────┘                  │               │
│          │                             │                            │               │
│          │                             │                            │               │
│          │                    ┌────────▼─────────┐                  │               │
│          │                    │      brands      │◀─────────────────┘               │
│          │                    └────────┬─────────┘                                  │
│          │                             │                                            │
│          │         ┌───────────────────┼───────────────────┐                        │
│          │         │                   │                   │                        │
│          │         ▼                   ▼                   ▼                        │
│          │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐               │
│          │  │   products   │  │    brand_    │  │ brand_visibility │               │
│          └─▶│              │  │ competitors  │  │    _reports      │               │
│             └──────┬───────┘  └──────────────┘  └──────────────────┘               │
│                    │                                                                │
│         ┌──────────┼──────────┬────────────────────┐                               │
│         │          │          │                    │                               │
│         ▼          ▼          ▼                    ▼                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────────┐                   │
│  │ product_ │ │visibility│ │  visibility  │ │ product_visibility│                  │
│  │competitors│ │ _queries │ │_recommend.   │ │    _reports      │                   │
│  └──────────┘ └──────────┘ └──────────────┘ └──────────────────┘                   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Summary

| Table | Purpose | Parent | Row Count Est. |
|-------|---------|--------|----------------|
| `organizations` | Top-level tenant | - | Low |
| `organization_members` | User-org membership | organizations, auth.users | Low |
| `categories` | Brand grouping | organizations | Low |
| `brands` | Brand entities | organizations, categories | Medium |
| `products` | Products to track | brands | High |
| `brand_competitors` | Competing brands | brands | Medium |
| `product_competitors` | Competing products | products | Medium |
| `brand_visibility_reports` | Brand-level AI visibility | brands | High |
| `product_visibility_reports` | Product-level AI visibility | products | Very High |
| `visibility_queries` | Raw AI query logs | brands, products | Very High |
| `visibility_recommendations` | AI-generated suggestions | brands, products | Medium |

---

## Quick Reference

### User Context Model

Each user is attached to:
- **One organization** at a time
- **One brand** within that organization

The user's current context is stored in `organization_members.current_brand_id`.

```
User
└── organization_members (one per org user belongs to)
    ├── organization_id (which org)
    ├── current_brand_id (which brand they're viewing)
    └── role (permissions)
```

### Core Hierarchy
```
Organization
└── Category (optional)
    └── Brand
        └── Product
```

### Report Hierarchy
```
Brand Dashboard (Overview page)
├── Brand Visibility Report
│   └── Product Visibility Report
└── Visibility Queries (raw data)
```

### Competitor Hierarchy
```
Brand
├── Brand Competitors
└── Products
    └── Product Competitors
```

---

## See Also

- [Table Definitions](TABLES.md) - Detailed table schemas
- [RLS Policies](RLS_POLICIES.md) - Security policies
- [Migrations](MIGRATIONS.md) - Migration strategy
