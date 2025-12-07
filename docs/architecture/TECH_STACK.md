# Tech Stack

## Overview

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js | 15.3.4 |
| UI Library | React | 19.1.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Components | shadcn/ui | Latest |
| Database | Supabase (PostgreSQL) | - |
| Authentication | Supabase Auth | - |
| AI Agents | CrewAI | 0.80.0+ |
| Agent API | FastAPI | 0.115.0+ |
| Workflow Automation | n8n | Self-hosted |
| Real-time | WebSocket (ws) | - |
| Containerization | Docker | - |

---

## Frontend

### Next.js 15

```
- App Router (app directory)
- Server Components
- Client Components
- Middleware for auth
- API routes (if needed)
```

### React 19

```
- Latest React features
- Concurrent rendering
- Suspense boundaries
- Server Components support
```

### Tailwind CSS

```
- Custom theme with CSS variables
- Dark mode support (prepared)
- Responsive design utilities
- Custom animations
```

### shadcn/ui

Pre-installed components:
- Accordion, Alert, Avatar, Badge
- Button, Card, Checkbox, Dialog
- Dropdown, Form, Input, Label
- Select, Sidebar, Skeleton, Switch
- Table, Tabs, Toast, Tooltip
- And many more...

### Fonts

- **Manrope** - Primary UI font
- **Heebo** - Special text

---

## Backend

### Supabase

```
- PostgreSQL database
- Row Level Security (RLS)
- Authentication (Google OAuth)
- Edge Functions (Deno)
- Realtime subscriptions (optional)
- Storage (optional)
```

### n8n

```
- Self-hosted workflow automation
- Webhook triggers
- HTTP request nodes
- Supabase integration
- Scheduling (cron)
```

### CrewAI

```
- Python-based AI agents
- Tool integration (search_google)
- Task execution
- Multi-step reasoning
- OpenAI GPT-4 backend
```

### FastAPI

```
- High-performance Python API
- Async support
- Pydantic models
- Auto-generated docs
- CORS middleware
```

### WebSocket Server

```
- Node.js with ws library
- Express for HTTP endpoints
- Connection management
- Client identification
```

---

## External APIs

### Current

| API | Purpose | Auth |
|-----|---------|------|
| SerpAPI | Google search for product research | API Key |
| OpenAI | GPT-4 for CrewAI agent | API Key |
| Google OAuth | User authentication | Supabase config |

### Planned (Visibility Monitoring)

| API | Purpose | Auth |
|-----|---------|------|
| OpenAI | ChatGPT queries | API Key |
| Anthropic | Claude queries | API Key |
| Perplexity | Perplexity queries | API Key |
| Google AI | Gemini queries | API Key |
| Microsoft | Copilot queries | API Key |

---

## Development Tools

### Package Managers
- npm (frontend)
- pip (Python backend)

### Code Quality
- TypeScript (frontend)
- Python type hints (backend)
- ESLint (if configured)

### Version Control
- Git
- GitHub (assumed)

### Containerization
- Docker
- docker-compose

---

## Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Backend (agents/.env)

```bash
OPENAI_API_KEY=
SERPAPI_API_KEY=
PORT=8000
```

### n8n

```bash
N8N_BASIC_AUTH_ACTIVE=
N8N_BASIC_AUTH_USER=
N8N_BASIC_AUTH_PASSWORD=
```

---

## Architecture Decisions

### Why Next.js 15?

- Latest features (App Router, Server Components)
- Great DX with file-based routing
- Built-in optimization
- Easy deployment (Vercel, etc.)

### Why Supabase?

- PostgreSQL with full SQL support
- Built-in auth with social providers
- Row Level Security for multi-tenancy
- Edge Functions for serverless logic
- Real-time subscriptions

### Why CrewAI?

- AI agent framework for complex tasks
- Tool integration for external APIs
- Multi-step reasoning
- Python ecosystem

### Why n8n?

- Visual workflow builder
- Easy to modify without code
- Self-hosted (data privacy)
- Many integrations

### Why WebSocket?

- Real-time updates
- Better UX than polling
- Efficient for live notifications

---

## Scaling Considerations

| Component | Current | Scaling Option |
|-----------|---------|----------------|
| Frontend | Single instance | Vercel auto-scaling |
| Supabase | Managed | Pro/Team plan |
| n8n | Single instance | Queue workers |
| CrewAI | Single container | Kubernetes/ECS |
| WebSocket | Single server | Redis adapter |

---

## See Also

- [Architecture Overview](OVERVIEW.md)
- [Current State](CURRENT_STATE.md)
