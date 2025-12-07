# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           Next.js 15 App Router                               │   │
│  │                                                                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │Dashboard │  │ Brands   │  │ Products │  │ Reports  │  │ Settings │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                                                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  shadcn/ui Components  |  Tailwind CSS  |  React 19                     │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  Supabase Client (Auth + Database)  |  WebSocket Client                 │  │   │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└───────────────────────────────────────┬──────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND                                           │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                              Supabase                                         │   │
│  │                                                                                │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                   │   │
│  │  │   PostgreSQL   │  │ Authentication │  │ Edge Functions │                   │   │
│  │  │   Database     │  │   (Google)     │  │ (update-product│                   │   │
│  │  │   + RLS        │  │                │  │  etc.)         │                   │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘                   │   │
│  │                                                                                │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                             n8n Workflows                                     │   │
│  │                                                                                │   │
│  │  ┌────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Product Research Workflow:                                              │   │   │
│  │  │ Webhook → CrewAI → Supabase Update → WebSocket Notify                  │   │   │
│  │  └────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                │   │
│  │  ┌────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │ Visibility Monitoring Workflow: (Planned)                               │   │   │
│  │  │ Schedule → Query AI Platforms → Analyze → Generate Reports             │   │   │
│  │  └────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         CrewAI Agent (Docker)                                 │   │
│  │                                                                                │   │
│  │  ┌────────────────────────────────────────────────────────────────────────┐   │   │
│  │  │ FastAPI Server (:8000)                                                  │   │   │
│  │  │                                                                          │   │   │
│  │  │  ┌───────────────────────────────────────────────────────────────────┐  │   │   │
│  │  │  │ Product Research Agent                                            │  │   │   │
│  │  │  │ - Autonomous web search (SerpAPI)                                 │  │   │   │
│  │  │  │ - Product information extraction                                  │  │   │   │
│  │  │  └───────────────────────────────────────────────────────────────────┘  │   │   │
│  │  │                                                                          │   │   │
│  │  │  ┌───────────────────────────────────────────────────────────────────┐  │   │   │
│  │  │  │ Visibility Analysis Agent (Planned)                               │  │   │   │
│  │  │  │ - Query ChatGPT, Claude, Perplexity, Gemini, Copilot             │  │   │   │
│  │  │  │ - Analyze responses for mentions                                  │  │   │   │
│  │  │  │ - Calculate visibility scores                                     │  │   │   │
│  │  │  └───────────────────────────────────────────────────────────────────┘  │   │   │
│  │  └────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         WebSocket Server (Node.js)                            │   │
│  │                                                                                │   │
│  │  - Real-time product status updates                                           │   │
│  │  - Client connection management                                               │   │
│  │  - Callback from n8n workflows                                               │   │
│  │                                                                                │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                       │
│                                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   SerpAPI    │  │   OpenAI     │  │  Anthropic   │  │  Perplexity  │             │
│  │   (Search)   │  │   (GPT-4)    │  │   (Claude)   │  │     API      │             │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                                      │
│  ┌──────────────┐  ┌──────────────┐                                                 │
│  │   Google     │  │  Microsoft   │                                                 │
│  │   (Gemini)   │  │  (Copilot)   │                                                 │
│  └──────────────┘  └──────────────┘                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Product Research

```
1. User adds product
        │
        ▼
2. Next.js inserts into Supabase (status: pending)
        │
        ▼
3. Next.js calls n8n webhook
        │
        ▼
4. n8n calls CrewAI endpoint
        │
        ▼
5. CrewAI agent searches web (SerpAPI)
        │
        ▼
6. CrewAI returns structured product data
        │
        ▼
7. n8n updates Supabase via Edge Function (status: ready)
        │
        ▼
8. n8n notifies WebSocket server
        │
        ▼
9. WebSocket pushes update to client
        │
        ▼
10. UI updates in real-time
```

---

## Data Flow: Visibility Monitoring (Planned)

```
1. Scheduler triggers (daily)
        │
        ▼
2. For each active product/brand:
        │
        ▼
3. Generate relevant queries
        │
        ▼
4. Query AI platforms (ChatGPT, Claude, Perplexity, Gemini, Copilot)
        │
        ▼
5. Analyze responses:
   - Is product mentioned?
   - What position?
   - Sentiment?
   - Competitors mentioned?
        │
        ▼
6. Calculate visibility scores
        │
        ▼
7. Store in visibility_queries and visibility_reports tables
        │
        ▼
8. Generate recommendations
        │
        ▼
9. Notify users of significant changes
```

---

## Component Responsibilities

### Frontend (Next.js)

| Component | Responsibility |
|-----------|----------------|
| App Router | Page routing and layouts |
| Server Components | Initial data fetching |
| Client Components | Interactive UI |
| Supabase Client | Auth and database queries |
| WebSocket Hook | Real-time updates |

### Supabase

| Component | Responsibility |
|-----------|----------------|
| PostgreSQL | Data storage with RLS |
| Auth | User authentication (Google OAuth) |
| Edge Functions | Privileged operations (bypass RLS) |
| Realtime | WebSocket subscriptions (optional) |

### n8n

| Component | Responsibility |
|-----------|----------------|
| Webhooks | Trigger workflows from frontend |
| HTTP Nodes | Call external APIs (CrewAI, Supabase) |
| Scheduling | Trigger periodic visibility checks |
| Error Handling | Retry failed operations |

### CrewAI

| Component | Responsibility |
|-----------|----------------|
| FastAPI | HTTP API for n8n |
| Agents | Autonomous AI workers |
| Tools | Web search, API calls |
| Task Execution | Multi-step reasoning |

### WebSocket Server

| Component | Responsibility |
|-----------|----------------|
| Connection Manager | Track connected clients |
| Message Routing | Send updates to correct clients |
| n8n Integration | Receive callbacks |

---

## Security Model

### Authentication
- Google OAuth via Supabase Auth
- JWT tokens for API calls
- Session management in middleware

### Authorization
- Row Level Security (RLS) on all tables
- Organization-based access control
- Role-based permissions (owner, admin, manager, analyst, viewer)

### API Security
- Supabase anon key for public operations
- Service role key for privileged operations (Edge Functions only)
- n8n webhook authentication

---

## Scalability Considerations

### Current Setup (Development)
- Single Supabase instance
- Single n8n instance
- Single Docker container for CrewAI
- Local WebSocket server

### Production Scaling
- Supabase handles database scaling
- n8n can be self-hosted with queue workers
- CrewAI can be horizontally scaled (multiple containers)
- WebSocket can use Redis adapter for multi-instance

---

## See Also

- [Current State](CURRENT_STATE.md)
- [Tech Stack](TECH_STACK.md)
