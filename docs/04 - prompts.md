# Code Generation Prompts (Complete)

Use these prompts **sequentially** with a code-generation LLM.  
Each prompt **builds on the previous** and **wires new code** into the existing project—no orphaned files.

**Global Constraints & Choices**
- React 18 + TypeScript (strict), Vite bundler with **Vite SSR** (no Next.js).
- React Router, TanStack Query, Redux (single slice), SCSS (BEM), Jest + RTL.
- SSR: server-render initial HTML (Popular on Home, Movie Detail), then hydrate.
- Styling: per-component SCSS + one global reset + `_variables.scss`.
- A11y basic labels, mouse/touch only for carousel/drawer interaction.
- Wishlist in Redux, persisted to `localStorage`.
- No UI libraries; build carousels & drawer from scratch.

---

## Prompt 01 — Initialize Vite + SSR skeleton
```text
Create a Vite React TypeScript project and add SSR entries.

**What to do**
1) Initialize project
- Run: `npm create vite@latest` → template: `react-ts`.
- Ensure `tsconfig.json` has `"strict": true`.

2) Add SSR entries
- Create `src/entry-client.tsx` that:
  - Imports `React`, `createRoot`/`hydrateRoot` from `react-dom/client` (use `hydrateRoot`).
  - Renders `<App />` wrapped with Redux Provider and React Query’s `QueryClientProvider` + `Hydrate` using a client-created query client and `window.__DEHYDRATED_STATE__`.

- Create `src/entry-server.tsx` that exports `async function render(url: string, ssrContext?: Record<string, any>)`:
  - Creates **per-request** Redux store and QueryClient.
  - Uses React Router **StaticRouter** to render the correct route for `url`.
  - Wraps the tree in `QueryClientProvider` and Redux `Provider`.
  - Uses `@tanstack/react-query` `dehydrate()` to capture server cache.
  - Returns `{ html, headTags, dehydratedState }`.

3) Minimal Node server (no frameworks) at `server/index.ts`
- In **dev**: use Vite middleware (`createServer({ server: { middlewareMode: true } })`). For each request:
  - Load the SSR module (`/src/entry-server.tsx`) via `vite.ssrLoadModule`.
  - Call `render(req.originalUrl)` and inject the returned HTML and dehydrated state into the template.
- In **preview/build**: load built server bundle (Vite SSR output) and serve similarly.
- Provide an HTML template that includes placeholders:
  - `<!--app-html-->` for SSR HTML.
  - A script that assigns `window.__DEHYDRATED_STATE__ = ...`.

4) Package scripts in `package.json`:
- `"dev"`: run the node server with Vite in middleware mode.
- `"build"`: Vite build for client and SSR (two outputs).
- `"preview"`: run the built server.

**Acceptance criteria**
- `npm run dev` starts a server that returns a basic HTML with an empty app container ready to hydrate (no actual routes yet).
- No Next.js. No UI frameworks.

```

## Prompt 02 — Router & App shell
```text
Add routing and a basic App shell.

**What to do**
1) Install React Router v6.
2) Create `src/app/router.tsx`:
- Export a function that returns a Router element:
  - On the client, wrap with `<BrowserRouter>`.
  - On the server, use `<StaticRouter location={url}>` (prop provided by entry-server).
- Define routes:
  - `/` → `HomePage`
  - `/movie/:id` → `MovieDetailPage`
  - `*` → `NotFoundPage`
3) Create pages:
- `src/app/routes/HomePage.tsx`: temporary `<main>Home</main>`.
- `src/app/routes/MovieDetailPage.tsx`: temporary `<main>Detail</main>`.
- `src/app/routes/NotFoundPage.tsx`: friendly message and link to Home.
4) App shell & Header:
- `src/components/Header/Header.tsx` + `Header.scss`:
  - Fixed header with app title/logo (placeholder) and a **Wishlist** button (no functionality yet).
- Ensure the layout renders `<Header />` and a `<main>` with an `<Outlet />` under it.
5) Wire the Router into `entry-client` and `entry-server` app trees.

**Acceptance criteria**
- Navigating to `/` or `/movie/123` or `/whatever` shows the corresponding placeholder pages.
- Header is visible and fixed. No visual glitches.

```

## Prompt 03 — ESLint + Prettier + path aliases
```text
Configure linting/formatting and clean imports.

**What to do**
1) ESLint
- Add `.eslintrc` with React + TS recommended configs and Prettier plugin.
- Add `.eslintignore` for build and node_modules.

2) Prettier
- Add `.prettierrc` (semi: true, singleQuote: true, trailingComma: "all", printWidth: 100).
- Add `.vscode/settings.json` to enable format on save and ESLint validation (optional).

3) Path aliases
- In `tsconfig.json`, set `"baseUrl": "."` and `"paths"` for:
  - `@components/*`, `@app/*`, `@redux/*`, `@queries/*`, `@types/*`, `@utils/*`, `@styles/*`.
- Match the same aliases in `vite.config.ts` under `resolve.alias`.

**Acceptance criteria**
- `npm run lint` works.
- Imports can use `@components/...` etc without relative path hell.

```

## Prompt 04 — Jest + RTL + coverage
```text
Set up Jest with React Testing Library and coverage.

**What to do**
1) Install testing stack:
- `jest`, `@types/jest`, `ts-jest` (or `@swc/jest`), `jest-environment-jsdom`
- `@testing-library/react`, `@testing-library/jest-dom`
- `identity-obj-proxy` (for SCSS module mapping)

2) `jest.config.ts`:
- `testEnvironment: "jsdom"`
- Transform TS with ts-jest or swc.
- `moduleNameMapper`: map `\.(css|scss)$` → `identity-obj-proxy`.
- `setupFilesAfterEnv`: `["<rootDir>/src/test/setup.ts"]`.

3) `src/test/setup.ts`:
- `import "@testing-library/jest-dom"`.

4) package.json scripts:
- `"test"` and `"test:coverage"` with `--coverage`.

**Acceptance criteria**
- A trivial test (e.g., rendering `<Header />`) runs and coverage reports are generated.

```

## Prompt 05 — Redux store (single slice) + persistence
```text
Create Redux store and single app slice with localStorage persistence.

**What to do**
1) Install `@reduxjs/toolkit` and `react-redux`.
2) `src/types/tmdb.ts` (temporary wishlist type):
- Export `WishlistItem` with `{ id: number; title: string; poster_path: string | null; category?: "popular"|"top_rated"|"upcoming" }` (will refine later).

3) `src/redux/appSlice.ts`:
- State:
  ```ts
  interface AppState {
    wishlist: Record<number, WishlistItem>;
    ui: { isWishlistOpen: boolean };
  }
  ```
- Reducers:
  - `toggleWishlistItem(item: WishlistItem)` (add if missing, remove if present)
  - `removeWishlistItem(id: number)`
  - `openWishlist()` / `closeWishlist()`

4) `src/redux/store.ts`:
- `configureStore({ reducer: { app: appReducer } })`
- Export `RootState`, `AppDispatch`

5) `src/redux/persistence.ts`:
- `loadState()` reads JSON from `localStorage.getItem("app")` (client only).
- `saveState()` persists only the `wishlist` key; throttle writes (e.g., 500ms).

6) Wire in `entry-client.tsx`:
- Create store, load persisted state on boot, subscribe to save changes.

**Acceptance criteria**
- Able to dispatch `openWishlist()` without errors; state persists across reloads.

```

## Prompt 06 — TanStack Query + SSR dehydration glue
```text
Add React Query and dehydration.

**What to do**
1) Install `@tanstack/react-query`.
2) `src/queries/client.ts`:
- Export `createQueryClient()` with sensible defaults (retry: 1, staleTime: 0 for now).

3) `src/entry-server.tsx`:
- Create a QueryClient per request; wrap app with `QueryClientProvider`.
- After any prefetching (later prompts), call `dehydrate(queryClient)` and return the state.

4) `src/entry-client.tsx`:
- Read `window.__DEHYDRATED_STATE__` and pass to `<Hydrate state={...}>`.

**Acceptance criteria**
- App still runs; no data yet but hydration pipeline is wired.

```

## Prompt 07 — SCSS variables, BEM, and base utils
```text
Establish styling foundation.

**What to do**
1) Create `src/styles/reset.scss` and import it at the app root (client entry or main layout).
2) Create `src/styles/_variables.scss` with:
- Colors: `$color-bg`, `$color-text`, `$color-accent`, `$color-border`, etc.
- Spacing scale and `$bp-mobile: 480px`, `$bp-desktop: 1024px`.

3) Update `Header.scss` to use BEM:
- `.header`, `.header__brand`, `.header__actions`, `.header__wishlist-btn`.

4) Utilities:
- `src/utils/text.ts` with `truncate(text: string, max: number): string`.

**Acceptance criteria**
- Styles compile; header looks tidy; variables available to components.

```

## Prompt 08 — TMDB types & fetcher
```text
Implement TMDB types and fetch utilities.

**What to do**
1) `src/types/tmdb.ts`:
- `export type Category = "popular" | "top_rated" | "upcoming";`
- `export interface MovieSummary { id: number; title: string; overview: string; poster_path: string | null; }`
- `export interface MovieDetail { id: number; title: string; overview: string; poster_path: string | null; }`
- `export interface PagedResponse<T> { page: number; results: T[]; total_pages: number; total_results: number; }`

2) `src/queries/tmdb.ts`:
- Base fetch utility `api<T>(path: string, params?: Record<string, string|number>)` that appends `api_key` from `import.meta.env.VITE_TMDB_API_KEY`.
- Functions:
  - `fetchPopular(page: number)` → `PagedResponse<MovieSummary>`
  - `fetchTopRated(page: number)` → `PagedResponse<MovieSummary>`
  - `fetchUpcoming(page: number)` → `PagedResponse<MovieSummary>`
  - `fetchMovieDetail(id: number)` → `MovieDetail`
- Query key helpers:
  - `moviesKey(category: Category, page?: number)` → `['movies', category, page ?? 1]`
  - `movieKey(id: number)` → `['movie', id]`

**Acceptance criteria**
- You can `await fetchPopular(1)` in a dev console and see valid data (with real key).

```

## Prompt 09 — MovieCard + responsive images
```text
Create a reusable MovieCard component with responsive images.

**What to do**
1) `src/utils/images.ts`:
- `posterUrlForSize(path: string | null, size: "mobile" | "desktop"): string`
  - Use TMDB CDN: `https://image.tmdb.org/t/p/` with sizes `w185` (mobile), `w342` or `w500` (desktop).
  - If `path` is null, return a local placeholder.

2) `src/components/MovieCard/MovieCard.tsx` + `.scss`:
- Props: `{ movie: MovieSummary; onClick?: () => void }`.
- Render poster `<img loading="lazy" alt={movie.title} src={posterUrlForSize(...)}>` and title below.
- BEM classes: `.movie-card`, `.movie-card__image`, `.movie-card__title`.
- Subtle hover scale/shadow on desktop.

3) Export `MovieCard` from an index barrel if you prefer.

**Acceptance criteria**
- Rendering a `MovieCard` with sample data shows image + title with hover effect.

```

## Prompt 10 — Skeleton & ErrorPanel
```text
Create loading and error UI components.

**What to do**
1) Skeletons
- `src/components/Skeleton/CardSkeleton.tsx`: renders a rectangle with shimmer.
- `src/components/Skeleton/RowSkeleton.tsx`: renders a row of card skeletons.
- `Skeleton.scss`: keyframes shimmer and base styles.

2) ErrorPanel
- `src/components/ErrorPanel/ErrorPanel.tsx`: props `{ message?: string; onRetry?: () => void }`.
- Shows a compact error message and a **Retry** button when `onRetry` provided.

**Acceptance criteria**
- Skeletons and ErrorPanel render cleanly and are reusable.

```

## Prompt 11 — HomePage: SSR prefetch Popular (page 1)
```text
Wire SSR data for Popular movies on the HomePage.

**What to do**
1) In `entry-server.tsx`:
- If `url` is exactly `/`, call `queryClient.prefetchQuery(moviesKey('popular', 1), () => fetchPopular(1))` before render.

2) In `src/app/routes/HomePage.tsx`:
- Use `useQuery` for `moviesKey('popular', 1)`.
- On the server, data should be present → render list immediately.
- On the client, if not yet present, show a `RowSkeleton` then content.

3) For now, render a simple horizontal list of `MovieCard`s (we'll replace with `Carousel` soon).

**Acceptance criteria**
- View source shows movie titles in HTML for Popular (SSR worked).
- Client hydrates without flash of empty content.

```

## Prompt 12 — Carousel component (structure + arrows)
```text
Build the Carousel structure with arrow buttons.

**What to do**
1) `src/components/Carousel/Carousel.tsx` + `.scss`:
- Props: `{ children: React.ReactNode[]; onEndReached?: () => void }` (we'll integrate infinite soon).
- Structure:
  - Root `.carousel`
  - Left button `.carousel__arrow--left`
  - Scrollable track `.carousel__track` (horizontal overflow)
  - Right button `.carousel__arrow--right`
- On arrow click, smooth-scroll the track by N cards width (e.g., 3 cards).

2) Replace the simple Popular list in `HomePage` with `<Carousel>` that contains the `MovieCard`s.

**Acceptance criteria**
- Arrows move the track smoothly. No infinite yet.

```

## Prompt 13 — useCarousel hook (infinite & controls)
```text
Add a hook to manage scroll logic and a sentinel for infinite loading.

**What to do**
1) `src/components/Carousel/useCarousel.ts`:
- Returns refs `{ trackRef, endSentinelRef }` and methods `{ scrollPrev, scrollNext }`.
- Calculates scroll amount based on card width and visible area.
- Attaches an `IntersectionObserver` to `endSentinelRef`; when visible, call `onEndReached` prop.

2) Update `Carousel` to use the hook and forward `onEndReached`.

**Acceptance criteria**
- `onEndReached` fires when nearing the end of the track; arrows still work.

```

## Prompt 14 — Infinite Query for Popular
```text
Convert Popular to infinite query and load more pages on end reached.

**What to do**
1) In `HomePage`, use `useInfiniteQuery` for Popular:
- `getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined`
- Render all pages' results flat in the Carousel children.

2) Pass `onEndReached={() => fetchNextPage()}` to Carousel and show a small `CardSkeleton` set while `isFetchingNextPage` is true (append at the end).

**Acceptance criteria**
- Scrolling to the end loads page 2, 3, ... until no more pages.

```

## Prompt 15 — Lazy Top Rated & Upcoming rows
```text
Add Top Rated and Upcoming carousels as lazy client-only sections.

**What to do**
1) In `HomePage`, create placeholders for Top Rated and Upcoming using `RowSkeleton`.
2) Use an `IntersectionObserver` per row to mount the real Carousel when the row first enters the viewport:
- On mount, initialize `useInfiniteQuery` for that category (same pattern as Popular).

3) Ensure arrows, `onEndReached` and skeleton-on-fetch behaviors match.

**Acceptance criteria**
- Initial HTML (SSR) only includes Popular.
- As you scroll, Top Rated and Upcoming mount and load data on client.

```

## Prompt 16 — Swipe gestures (mobile)
```text
Add mobile swipe for the Carousel.

**What to do**
1) In `useCarousel`, add pointer/touch handlers:
- On pointer down, record startX/time.
- On move/up, compute delta and velocity; if over threshold (e.g., 60px or velocity), call `scrollNext/Prev`.

2) Ensure passive listeners for performance and prevent scroll jank.
3) Do not add keyboard handling (per requirements).

**Acceptance criteria**
- On mobile/touch, swiping left/right advances the carousel as expected.

```

## Prompt 17 — Navigation from cards
```text
Clicking a movie card navigates to the detail page and passes category.

**What to do**
1) Update `MovieCard` usage to pass `onClick={() => navigate(`/movie/${movie.id}`, { state: { category } })}` where `category` is the current row’s category.
2) Ensure `HomePage` knows the `category` for each row and passes it to the card click.

**Acceptance criteria**
- Clicking a card opens `/movie/:id`; the router state contains the category.

```

## Prompt 18 — Detail route SSR + SEO
```text
Server-prefetch the detail data and set SEO tags.

**What to do**
1) In `entry-server.tsx`:
- If `url` matches `/movie/:id`, parse `id`, call `prefetchQuery(movieKey(id), () => fetchMovieDetail(id))`.
- After render, set `<title>` = `${movie.title} — Movie Details` and `<meta name="description">` = truncated overview.
- Add OG tags (`og:title`, `og:description`, `og:image` if poster). Inject into `headTags` return.

2) `src/app/routes/MovieDetailPage.tsx`:
- Use `useQuery(movieKey(id), ...)` to read the detail (prefetched SSR).
- Render poster, title, overview.

**Acceptance criteria**
- View source on `/movie/:id` shows title and meta tags with movie values.

```

## Prompt 19 — Category fonts & CTA styles
```text
Add simple category-based font and button variants on the detail page.

**What to do**
1) `src/app/routes/MovieDetailPage.scss`:
- Root `.detail` plus modifiers `.detail--popular`, `.detail--top-rated`, `.detail--upcoming` that change **system font stacks** slightly per category.
- CTA button `.detail__cta` with modifier classes for each category (e.g., color or border differences).

2) Apply the correct modifier class based on the route state `category` (or fallback to 'popular').

**Acceptance criteria**
- Visual difference in font/button per category on detail page.

```

## Prompt 20 — Wishlist toggle
```text
Connect the CTA button to Redux wishlist (toggle add/remove).

**What to do**
1) In `MovieDetailPage`, read wishlist from Redux; compute `isInWishlist` by id.
2) Button text: `Add to wishlist` or `Remove from wishlist`.
3) On click, dispatch `toggleWishlistItem({ id, title, poster_path, category })`.
4) Ensure types align with `WishlistItem`.

**Acceptance criteria**
- Toggling reflects in Redux state; button label updates immediately.

```

## Prompt 21 — Scroll restoration
```text
Restore scroll position when navigating back to Home.

**What to do**
1) Implement scroll restoration for the Home route:
- On unmount or before navigate, store `window.scrollY` and the horizontal scroll of each carousel.
- On navigate back to `/`, restore these positions.

2) Use React Router's built-in `<ScrollRestoration>` if available; otherwise, implement a simple store keyed by route pathname.

**Acceptance criteria**
- After visiting a detail and hitting back, the home page returns to prior scroll positions.

```

## Prompt 22 — Wishlist Drawer (lazy)
```text
Add the animated wishlist drawer, lazy-loaded.

**What to do**
1) `src/components/WishlistDrawer/WishlistDrawer.tsx` + `.scss`:
- Off-canvas `<aside>` with overlay; slide-in/out animation.
- Render items from Redux `wishlist` (poster thumbnail, title, category badge).
- Each item has a remove X/trash button to dispatch `removeWishlistItem(id)`.

2) Header’s Wishlist button:
- Dispatches `openWishlist()`; drawer shows when `isWishlistOpen` is true.
- On close, `closeWishlist()` and **return focus** to the header button (store a ref to opener).

3) Lazy-load the drawer (dynamic `import()`); first open triggers chunk load.

**Acceptance criteria**
- Drawer opens/closes with animation; items appear; remove works; returns focus to opener.

```

## Prompt 23 — Persistence polish
```text
Verify Redux ↔ localStorage end-to-end.

**What to do**
1) Confirm `loadState()` hydrates the wishlist on initial client load.
2) Confirm `saveState()` writes only wishlist to `localStorage`, throttled.
3) Manual test:
- Add an item, reload page, open drawer → item persists.

**Acceptance criteria**
- Wishlist state survives reloads.

```

## Prompt 24 — Error boundaries & retry
```text
Add error boundaries around key sections and wire retry buttons.

**What to do**
1) `src/components/ErrorBoundary/ErrorBoundary.tsx`:
- A small class component that renders a fallback with a "Try again" button that reloads the current route.
2) Wrap:
- Home carousels container
- MovieDetail root
- Wishlist drawer root

3) Pass `onRetry` from queries to `ErrorPanel` buttons to call `refetch()`.

**Acceptance criteria**
- Render errors show a safe fallback; fetch errors show a Retry button that refetches.

```

## Prompt 25 — Performance tune
```text
Optimize images, queries, and re-renders.

**What to do**
1) `posterUrlForSize`: choose `w185` for mobile, `w342` or `w500` for desktop; memoize computation where useful.
2) `React.memo(MovieCard)`; ensure handlers/props are stable (useCallback/useMemo where needed).
3) TanStack Query options:
- Carousels: `staleTime: 60000`.
- Detail: `staleTime: 300000`.

4) Route-level code splitting:
- Dynamic `import()` for HomePage, MovieDetailPage, and WishlistDrawer.

**Acceptance criteria**
- Scrolling is smooth; network usage efficient; chunks split as expected.

```

## Prompt 26 — 404 page & header polish
```text
Finalize global 404 and ensure header layout is solid.

**What to do**
1) `NotFoundPage`: friendly copy, link back to Home.
2) Header polish:
- Fixed at top; app content has top padding/margin to avoid overlap.
- Wishlist button has `aria-label="Open wishlist"`.

**Acceptance criteria**
- 404 looks good; header behaves well at all widths.

```

## Prompt 27 — Unit tests
```text
Add unit tests for reducers and utils with coverage.

**What to do**
1) `__tests__/unit/appSlice.test.ts`:
- toggle add → exists; toggle again → removed.
- removeWishlistItem removes by id.
- open/close toggles UI state.

2) `__tests__/unit/images.test.ts`:
- posterUrlForSize returns CDN sizes as expected; handles null path.

3) `__tests__/unit/text.test.ts`:
- truncate returns original when short; appends ellipsis when longer.

**Acceptance criteria**
- `npm run test:coverage` shows coverage including these units.

```

## Prompt 28 — Integration tests
```text
Add integration tests with mocked data objects (no MSW).

**What to do**
1) `__tests__/integration/HomePage.test.tsx`:
- Provide a pre-hydrated Query cache for Popular (page 1) and render Home → expect Popular titles in document (SSR sim).
- Simulate intersection to mount Top Rated/Upcoming and assert they render cards.
- Simulate `onEndReached` to call `fetchNextPage` and verify more cards appear.

2) `__tests__/integration/MovieDetailPage.test.tsx`:
- Provide pre-hydrated detail data; render detail; assert poster/title/overview.
- Click CTA to add/remove from wishlist; assert button text changes.

3) `__tests__/integration/WishlistDrawer.test.tsx`:
- Click header wishlist button to open; list shows items; click remove and assert item disappears.

**Acceptance criteria**
- Integration tests pass, demonstrating realistic user flows.

```

## Prompt 29 — README & .env.example
```text
Add minimal documentation and env sample.

**What to do**
1) `README.md`:
- How to run locally: install, dev, build, preview, test, coverage.
- Mention SSR support and the three categories (Popular SSR; Top Rated/Upcoming client).

2) `.env.example`:
- `VITE_TMDB_API_KEY=` placeholder.

**Acceptance criteria**
- New developers can run the project following README steps.

```

## Prompt 30 — Final pass (a11y & code tidy)
```text
Do a final quality pass.

**What to do**
1) A11y:
- Add `aria-label` to Carousel arrows ("Previous", "Next") and remove buttons ("Remove from wishlist").
- All images have `alt={movie.title}`.
- Drawer uses `<aside>` or `role="complementary"` and returns focus to opener.

2) Lint/format:
- Run ESLint and Prettier; fix issues.

3) Tests:
- Ensure unit + integration pass with coverage.

**Acceptance criteria**
- Clean lint, consistent formatting, passing tests, and accessible UI basics.

```
