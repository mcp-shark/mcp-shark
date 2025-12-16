# Coding Rules

This document contains all coding rules and standards for the chase-functions project (both backend and frontend). These rules must be followed in all code implementations.

## General Rules (Apply to Both Backend and Frontend)

### 0. MUST FOLLOW:
  - SOLID Principles
  - Clean Code Principles
  - React Principles (for frontend: Component composition, hooks best practices, performance optimization)
  - Tailwind CSS Principles (for frontend)
  - React Hooks Rules (for frontend)

### 1. Variable Declarations
- **ALWAYS use `const`** - Never use `let` or `var`
- If reassignment is needed, restructure the code to use `const`
- For React state, use `useState` hook (frontend only)
- Example:
  ```javascript
  // ✅ CORRECT
  const userId = await getUserId()
  const result = await processData(userId)
  const [count, setCount] = useState(0) // Frontend: React state
  
  // ❌ WRONG
  let userId = await getUserId()
  userId = await processData(userId)
  ```

### 2. File Size Limit
- **Backend: Maximum 250 lines per file**
- **Frontend: Maximum 300 lines per file**
- If a file exceeds the limit, split it into smaller modules
- Use barrel files (index.js) to export related modules

### 3. Barrel Files (Index Exports)
- **ALWAYS create barrel files** for each module/component directory
- Barrel files should be named `index.js` and export all public APIs
- Example structure:
  ```
  # Backend
  lib/
    xero/
      XeroConfig.js
      XeroService.js
      index.js  ← Barrel file
  
  # Frontend
  components/
    dashboard/
      ChaseCard.jsx
      ChaseDetailDialog.jsx
      index.js  ← Barrel file
  ```
- Barrel file example:
  ```javascript
  // Backend
  export { default as XeroConfig } from './XeroConfig.js'
  export { default as XeroService } from './XeroService.js'
  
  // Frontend
  export { default as ChaseCard } from './ChaseCard.jsx'
  export { default as ChaseDetailDialog } from './ChaseDetailDialog.jsx'
  ```

### 4. Logging
- **Backend: ALWAYS use Pino logger** - Never use `console.log`, `console.error`, etc.
  - Import logger: `import logger from '@/lib/utils/logger'`
  - Use appropriate log levels: `logger.error()`, `logger.warn()`, `logger.info()`, `logger.debug()`
- **Frontend: Use proper logging** - Avoid `console.log`, `console.error`, etc. in production
  - For development, use `console.log` sparingly
  - For production, implement proper error tracking (e.g., Sentry, LogRocket)
- Always include context/metadata in logs:
  ```javascript
  // ✅ CORRECT (Backend)
  logger.error('Error processing request', { error: error.message, userId, orgId })
  
  // ✅ CORRECT (Frontend - development)
  console.error('Error processing request', { error: error.message, userId, orgId })
  
  // ❌ WRONG
  console.error('Error processing request')
  ```

### 5. Import/Export
- Use ES6 modules (`import`/`export`)
- **Backend:** Always use explicit file extensions (`.js`) in imports
- **Frontend:** Always use explicit file extensions (`.jsx` for React components, `.js` for utilities)
- Prefer named exports over default exports when exporting multiple items
- Use barrel files for cleaner imports
- **Frontend:** Use path aliases (`@/`) for cleaner imports:
  ```javascript
  // ✅ CORRECT (Frontend)
  import { Button } from '@/components/ui/button'
  import { useChases } from '@/hooks/useChases'
  
  // ❌ WRONG (Frontend)
  import { Button } from '../../../components/ui/button'
  ```
- **NEVER use dynamic imports** (`await import()`, `import()`) - ALWAYS use static imports at the top of the file
- All imports must be at the top of the file, never inside functions, conditionals, or try-catch blocks
- Example:
  ```javascript
  // ✅ CORRECT - Static import at top
  import { logger } from '../../utils/logger.js';
  
  function someFunction() {
    logger.info('Something');
  }
  
  // ❌ WRONG - Dynamic import
  const { logger } = await import('../../utils/logger.js');
  
  // ❌ WRONG - Import inside function
  function someFunction() {
    const { logger } = await import('../../utils/logger.js');
    logger.info('Something');
  }
  ```

### 6. Error Handling
- Always use try-catch blocks for async operations
- **Backend:** Log errors with context using logger
- **Frontend:** Use React Error Boundaries for component-level error handling
- Display user-friendly error messages
- Never expose internal error details in production responses
- Example:
  ```javascript
  // ✅ CORRECT (Backend)
  try {
    const data = await fetchData()
    return data
  } catch (error) {
    logger.error('Error fetching data', { error: error.message, userId })
    throw error
  }
  
  // ✅ CORRECT (Frontend)
  try {
    const data = await fetchData()
    setData(data)
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to load data. Please try again.',
      variant: 'destructive'
    })
    console.error('Error fetching data:', error)
  }
  ```

### 7. Code Organization
- Group related functionality in the same directory
- Use clear, descriptive file names
- **Backend:** Follow the existing directory structure:
  - `lib/` - Core services and utilities
  - `src/routes/` - API routes
  - `src/services/` - Business logic
  - `src/repositories/` - Data access
- **Frontend:** Follow the existing directory structure:
  - `components/` - Reusable React components
  - `pages/` - Page-level components
  - `hooks/` - Custom React hooks
  - `lib/` - Utilities and API functions
  - `contexts/` - React contexts
- Create subdirectories for complex components:
  ```
  # Frontend
  components/
    dashboard/
      ChaseCard/
        ChaseCard.jsx
        ChaseCardHeader.jsx
        ChaseCardContent.jsx
        index.js
  ```

### 8. Command Execution
- **NEVER use `cd &&` in a single command**
- **ALWAYS run `cd` first, then run the command separately**
- This ensures proper directory context and avoids potential shell issues
- Example:
  ```bash
  # ✅ CORRECT
  cd /path/to/dir
  npm install
  
  # ❌ WRONG
  cd /path/to/dir && npm install
  ```

### 9. Conditional Statements
- **NEVER use single-line if conditions**
- **ALWAYS use multiline format with braces**
- This applies to all conditional statements: if, else, else if, while, for, etc.
- Example:
  ```javascript
  // ❌ WRONG - Single line
  if (condition) return value
  if (condition) doSomething()
  
  // ✅ CORRECT - Multiline with braces
  if (condition) {
    return value
  }
  
  if (condition) {
    doSomething()
  }
  ```

### 10. IIFEs (Immediately Invoked Function Expressions)
- **NEVER use IIFEs** - No `(() => {})()`, `(async () => {})()`, `(function() {})()`
- **ALWAYS use named functions or async functions**
- Extract logic into proper functions or use top-level await where appropriate
- **Frontend:** Use `useEffect` for side effects instead of IIFEs
- Example:
  ```javascript
  // ❌ WRONG - IIFE
  const result = (async () => {
    const data = await fetchData()
    return processData(data)
  })()
  
  // ✅ CORRECT - Named async function
  const fetchAndProcess = async () => {
    const data = await fetchData()
    return processData(data)
  }
  const result = await fetchAndProcess()
  
  // ✅ CORRECT - useEffect for side effects (Frontend)
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData()
      setData(data)
    }
    loadData()
  }, [])
  ```

## Backend-Specific Rules

### 11. Route Layer Architecture (CRITICAL RULE)
- **NEVER access repositories or Supabase directly in routes**
- **ONLY services can be accessed in routes**
- **ALL Supabase access MUST go through repositories**
- **Architecture: Routes → Services → Repositories → Supabase**
- Example:
  ```javascript
  // ❌ WRONG - Direct repository access in route
  router.get('/chases/:id', async (req, res) => {
    const chasesRepo = repositoryFactory.getChasesRepository();
    const chase = await chasesRepo.findById(req.params.id);
    res.json(chase);
  });
  
  // ❌ WRONG - Direct Supabase access in route
  router.get('/chases/:id', async (req, res) => {
    const { data } = await supabase.from('chases').select('*').eq('id', req.params.id);
    res.json(data);
  });
  
  // ✅ CORRECT - Use service in route
  router.get('/chases/:id', async (req, res) => {
    const chasesService = getChasesService();
    const chase = await chasesService.getChaseById(req.params.id);
    res.json(chase);
  });
  ```
- **Enforcement:**
  - Routes must NOT import `repositoryFactory` or `supabase`
  - Routes must NOT call `.from()`, `.storage`, or any Supabase methods
  - Routes must NOT instantiate repositories
  - All database operations must be encapsulated in services
  - Services can access repositories, repositories access Supabase

## Frontend-Specific Rules

### 12. React Component Rules

#### 12.1 Component Structure
- Use functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused on a single responsibility
- Extract complex logic into custom hooks
- Example:
  ```javascript
  // ✅ CORRECT
  const Dashboard = () => {
    const { data, isLoading } = useChases()
    
    if (isLoading) {
      return <LoadingSpinner />
    }
    
    return <div>{/* component JSX */}</div>
  }
  
  // ❌ WRONG
  class Dashboard extends React.Component {
    // class component
  }
  ```

#### 12.2 Hooks Rules
- Only call hooks at the top level (not inside loops, conditions, or nested functions)
- Only call hooks from React function components or custom hooks
- Use meaningful names for custom hooks (start with `use`)
- Extract complex state logic into custom hooks
- Example:
  ```javascript
  // ✅ CORRECT
  const useChases = () => {
    const [chases, setChases] = useState([])
    // ... hook logic
    return { chases, isLoading }
  }
  
  // ❌ WRONG
  if (condition) {
    const [state, setState] = useState() // ❌ Hook in condition
  }
  ```

#### 12.3 Props and State
- Use TypeScript or PropTypes for prop validation (if available)
- Destructure props at the component signature
- Use meaningful prop names
- Avoid prop drilling - use Context API when needed
- Example:
  ```javascript
  // ✅ CORRECT
  const ChaseCard = ({ chase, onStatusUpdate }) => {
    return <div>{/* component */}</div>
  }
  
  // ❌ WRONG
  const ChaseCard = (props) => {
    return <div>{props.chase.name}</div>
  }
  ```

#### 12.4 Performance Optimization
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed as props
- Avoid creating objects/arrays in render (use `useMemo`/`useCallback`)
- Example:
  ```javascript
  // ✅ CORRECT
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data)
  }, [data])
  
  const handleClick = useCallback(() => {
    doSomething()
  }, [dependencies])
  
  // ❌ WRONG
  const expensiveValue = computeExpensiveValue(data) // Recomputes every render
  ```

### 13. JSX Rules
- Use self-closing tags when appropriate: `<Component />` not `<Component></Component>`
- Use meaningful component names (PascalCase)
- Keep JSX readable - extract complex JSX into separate components
- Use fragments (`<>...</>`) instead of unnecessary divs
- Example:
  ```javascript
  // ✅ CORRECT
  return (
    <>
      <Header />
      <MainContent />
      <Footer />
    </>
  )
  
  // ❌ WRONG
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  )
  ```

### 14. Styling Rules
- Use Tailwind CSS utility classes
- Extract repeated style patterns into reusable components
- Use `cn()` utility for conditional classes
- Avoid inline styles unless absolutely necessary
- Example:
  ```javascript
  // ✅ CORRECT
  <div className={cn('base-classes', isActive && 'active-classes')} />
  
  // ❌ WRONG
  <div style={{ color: isActive ? 'red' : 'blue' }} />
  ```

## File Naming Conventions

- **Backend:**
  - Use PascalCase for classes: `XeroService.js`, `TokenStorage.js`
  - Use camelCase for utilities: `getOrgId.js`, `logger.js`
  - Use kebab-case for API routes: `route.js` (Next.js convention)
- **Frontend:**
  - Use PascalCase for React components: `ChaseCard.jsx`, `Dashboard.jsx`
  - Use camelCase for utilities and hooks: `useChases.js`, `api.js`
  - Use kebab-case for CSS files: `app.css`, `index.css`
- Use descriptive names that indicate purpose

## Documentation

- Add JSDoc comments for public functions and components
- Document complex logic with inline comments
- Keep comments up-to-date with code changes
- **Frontend:** Document component props (if not using TypeScript)

## Testing Considerations

- Write testable code (pure functions where possible)
- Keep functions focused on single responsibility
- Avoid side effects where possible
- **Frontend:** Use React Testing Library for component tests

## Phase Completion Checklist

**After completing each phase, ALWAYS run:**

1. **Build Check:**
   ```bash
   npm run build
   ```
   - Ensures all code compiles without errors
   - Catches TypeScript/JavaScript errors early
   - Verifies build configuration

2. **Lint Check:**
   ```bash
   npm run lint
   ```
   - Ensures code follows linting rules
   - Catches unused variables and expressions
   - Verifies code quality standards

3. **Format Check (Frontend):**
   ```bash
   npm run format:check
   ```
   - Ensures code follows Prettier formatting rules

4. **Update Progress:**
   - **ALWAYS update progress documentation**
   - **Backend:** Create or update `docs/PHASE[X]_PROGRESS.md`
   - **Frontend:** Create or update `docs/FRONTEND_REFACTORING_PROGRESS.md`
   - Include:
     - Status of each sub-phase (completed/pending)
     - Completed components/features/API endpoints
     - Files created/modified
     - Next steps

**DO NOT proceed to next phase until:**
- ✅ Build passes without errors
- ✅ Lint passes without errors
- ✅ Format check passes (frontend)
- ✅ All phase tasks are marked complete
- ✅ Progress is documented

## Progress Documentation Rule

**MANDATORY:** Always update progress documentation when:
- Starting a new phase → Create progress document with phase overview
- Completing a sub-phase → Update progress document with completion status
- Completing a phase → Mark phase as complete and add summary
- Creating new files → Add to "Files Created" section
- Modifying existing files → Add to "Files Modified" section

**Progress Document Format:**
- Phase status and last updated date
- Sub-phase breakdown with completion status (✅/⏳)
- Detailed list of completed items (API endpoints, components, features)
- Files created/modified sections
- Next steps section

This ensures clear tracking of implementation progress and helps with handoffs and project visibility.

## Data Source & Destination Rules

### Xero Integration
- **Xero is the SOURCE of truth for Transactions**
  - All transactions originate from Xero via sync
  - Transaction data is synced from Xero to `chase_xero_transactions` table
  - Never create transactions manually - they must come from Xero
  - Transaction status updates should reflect Xero's state

- **Xero is the DESTINATION for chase results**
  - When a chase is completed, results must be written back to Xero
  - Document uploads go to Xero
  - Bank statement CSVs are uploaded to Xero
  - Reconciliation status is updated in Xero
  - Use `xero_updated_at` and `xero_update_status` fields in `chase_chases` to track Xero updates

- **Transaction Flow:**
  1. Sync transactions from Xero → `chase_xero_transactions`
  2. Create chase from transaction → `chase_chases` (linked via `xero_transaction_id`)
  3. Process chase workflow
  4. Update Xero with results → Update `xero_updated_at` and `xero_update_status`
  5. Sync back from Xero to verify → Update `is_reconciled` in `chase_xero_transactions`

- **Important:**
  - Always sync from Xero before creating chases
  - Always update Xero after chase completion
  - Track Xero sync status in chase records
  - Never bypass Xero - it's the single source of truth

---

**Last Updated:** 2025-01-27
