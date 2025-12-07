# Cramler.ai Documentation

## AI Visibility Monitoring Platform

Transform from a single-user product research tool into a **multi-tenant AI visibility monitoring platform** where organizations can track how their brands and products appear across AI platforms (ChatGPT, Claude, Perplexity, Gemini, Copilot).

---

## User Context Model

Each user is attached to:
- **One organization** at a time
- **One brand** within that organization

The app view is always scoped to the current **Organization / Brand** context. Users can switch between organizations and brands via the header.

---

## Documentation Structure

```
docs/
├── README.md                    # This file - overview
│
├── architecture/
│   ├── OVERVIEW.md              # System architecture
│   ├── CURRENT_STATE.md         # Current codebase analysis
│   └── TECH_STACK.md            # Technology choices
│
├── database/
│   ├── SCHEMA.md                # Complete database schema
│   ├── TABLES.md                # Individual table definitions
│   ├── RLS_POLICIES.md          # Row Level Security policies
│   └── MIGRATIONS.md            # Migration strategy
│
├── frontend/
│   ├── PAGES.md                 # All frontend pages
│   ├── COMPONENTS.md            # Reusable components
│   ├── NAVIGATION.md            # Sidebar & navigation
│   └── pages/
│       ├── ONBOARDING.md        # Onboarding flow
│       ├── OVERVIEW.md          # Brand overview dashboard
│       ├── INSIGHTS.md          # Recommendations & competitors
│       └── PRODUCTS.md          # Product management
│
└── phases/
    ├── PHASE_1_DATABASE.md      # Database schema & migration
    ├── PHASE_2_ORG_BRANDS.md    # Organization & brand management
    ├── PHASE_3_PRODUCTS.md      # Product management refactor
    ├── PHASE_4_VISIBILITY.md    # Visibility monitoring engine
    ├── PHASE_5_REPORTS.md       # Reports & analytics
    ├── PHASE_6_COMPETITORS.md   # Competitor tracking
    └── PHASE_7_INSIGHTS.md      # Recommendations & insights
```

---

## Main Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/overview` | Brand visibility dashboard with stats, platform scores, and trends |
| Insights | `/insights` | AI recommendations, competitor analysis, and sample AI responses |
| Products | `/products` | Product list and detail pages for current brand |
| Settings | `/settings` | User, brand, and team settings |

---

## Quick Links

### Getting Started
- [Architecture Overview](architecture/OVERVIEW.md)
- [Current State Analysis](architecture/CURRENT_STATE.md)

### Database
- [Complete Schema](database/SCHEMA.md)
- [Table Definitions](database/TABLES.md)
- [RLS Policies](database/RLS_POLICIES.md)

### Frontend
- [All Pages](frontend/PAGES.md)
- [Navigation](frontend/NAVIGATION.md)
- [Page Designs](frontend/pages/)

### Implementation Phases
- [Phase 1: Database](phases/PHASE_1_DATABASE.md)
- [Phase 2: Organizations & Brands](phases/PHASE_2_ORG_BRANDS.md)
- [Phase 3: Products](phases/PHASE_3_PRODUCTS.md)
- [Phase 4: Visibility Engine](phases/PHASE_4_VISIBILITY.md)
- [Phase 5: Reports](phases/PHASE_5_REPORTS.md)
- [Phase 6: Competitors](phases/PHASE_6_COMPETITORS.md)
- [Phase 7: Insights](phases/PHASE_7_INSIGHTS.md)

---

## Phase Overview

| Phase | Focus | Priority | Status |
|-------|-------|----------|--------|
| 1 | Database Schema & Migration | Critical | Pending |
| 2 | Organization & Brand Management | Critical | Pending |
| 3 | Product Management Refactor | High | Pending |
| 4 | Visibility Monitoring Engine | High | Pending |
| 5 | Reports & Analytics | High | Pending |
| 6 | Competitor Tracking | Medium | Pending |
| 7 | Recommendations & Insights | Medium | Pending |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 + Tailwind + shadcn/ui |
| Backend | Supabase (Database + Auth + Edge Functions) |
| AI Agents | CrewAI + FastAPI (Docker) |
| Workflow | n8n |
| Real-time | WebSocket |
| AI Platforms | OpenAI, Anthropic, Perplexity, Google, Microsoft APIs |
