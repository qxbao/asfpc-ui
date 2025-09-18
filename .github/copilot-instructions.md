# ASFPC (Automated System for Finding Potential Customers) - AI Coding Guide

## Architecture Overview

This is a **dual-workspace system** with separate Next.js frontend (`asfpc-ui/`) and Go backend (`web/`) that work together to automate Facebook data collection and customer analysis.

**Frontend Stack:** Next.js 15 + TypeScript + Material-UI + Redux Toolkit + RTK Query  
**Backend Stack:** Go + Echo framework + PostgreSQL + Python automation scripts  
**Key Integration:** Python browser automation (Selenium/zendriver) for Facebook scraping

## Critical Development Workflows

### Environment Setup
```powershell
# Backend development (in web/ directory)
./dev.ps1  # Loads .env and starts air hot-reload

# Frontend development (in asfpc-ui/ directory)
pnpm dev --turbopack  # Use turbopack for faster builds
```

### Database Operations
- **Schema**: Located in `web/infras/sql/schema.sql` - PostgreSQL tables for accounts, groups, posts, profiles
- **Queries**: Use SQLC for type-safe SQL - edit `web/infras/sql/query.sql`, then regenerate with `sqlc generate`
- **Migrations**: Manual via schema.sql - no automated migration system

### Python Integration Pattern
- Python scripts in `web/python/` handle browser automation
- Go calls Python via subprocess execution (see `web/services/python.go`)
- Virtual environment managed via `web/python/venv.ps1`
- Browser state stored in `web/python/resources/user_data_dir/`

## Project-Specific Conventions

### API Design Pattern
```typescript
// Frontend: RTK Query endpoints in src/redux/api/
// Follow this exact pattern for new endpoints:
export const exampleApi = createApi({
  reducerPath: "exampleApi",
  baseQuery: customQuery(BackendURL),
  tagTypes: ["ExampleData"],
  endpoints: (builder) => ({
    getExample: builder.query<Response, Request>({
      query: (params) => ({ url: "/example", method: "GET", params }),
      providesTags: ["ExampleData"],
    }),
  })
})
```

### Component Architecture
- **Pages**: `src/app/(dashboard)/` - App Router with dashboard layout
- **Components**: `src/components/pages/` - Feature-specific page components
- **UI Kit**: `src/components/ui/` - Reusable UI components with Material-UI
- **State**: Redux slices in `src/redux/slices/` - Global app state management

### Backend Service Pattern
```go
// Follow this service layer pattern in web/services/
type Service struct {
    Server *infras.Server  // Access to DB and config
}

func (s *Service) HandleAction(ctx context.Context, req Request) error {
    // 1. Validate request
    // 2. Call database via s.Server.Queries
    // 3. Log action via logger.GetLogger(&serviceName)
    // 4. Return structured response
}
```

### Error Handling Strategy
- **Frontend**: RTK Query automatic error handling + custom dialog system via `dialogSlice`
- **Backend**: Echo middleware + structured JSON errors
- **Python**: Selenium exceptions logged to Go logger

## Critical Integration Points

### Frontend ↔ Backend Communication
- **API Base**: Environment variable `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8000`)
- **CORS**: Configured in `web/server/server.go` with `middleware.CORS()`
- **Authentication**: Cookie-based (stored in `account.cookies` JSON field)

### Go ↔ Python Communication
- **Execution**: Go spawns Python processes with environment variables from `.env`
- **Data Exchange**: File-based communication via temp files and database updates
- **Browser Management**: Python maintains persistent browser sessions for Facebook automation

### Database Integration
- **ORM**: SQLC generates type-safe Go code from SQL queries
- **Connection**: PostgreSQL via environment variables (see `.env` template in `web/README.MD`)
- **Logging**: All actions logged to `log` table with account tracking

## Key Files for Understanding

- `web/server/server.go` - Application bootstrap and dependency injection
- `web/infras/server.go` - Core server struct with shared dependencies
- `asfpc-ui/src/redux/store.ts` - Frontend state management setup
- `asfpc-ui/src/app/layout.tsx` - Root component with theme and store providers
- `web/python/browser/facebook.py` - Core Facebook automation logic
- `web/infras/sql/schema.sql` - Complete database schema

## Development Notes

- **Hot Reload**: Use `air` for Go backend, `--turbopack` for Next.js frontend
- **Debugging**: Check `web/tmp/build-errors.log` for Go compilation issues
- **Browser Issues**: Facebook automation requires specific user agent management (see `web/services/ua.go`)
- **Performance**: Database queries are paginated (see `src/components/pages/BotAccount/BotAccount.tsx` DataGrid example)

## Common Patterns to Follow

1. **New API Endpoint**: Add to `web/routes/`, implement in `web/services/`, add RTK Query endpoint in frontend
2. **New Database Entity**: Update `schema.sql`, add queries to `query.sql`, regenerate with SQLC
3. **New UI Feature**: Create in `src/components/pages/`, integrate with Redux state, follow Material-UI theming
4. **Python Script Integration**: Place in `web/python/`, call via Go service layer, handle errors gracefully