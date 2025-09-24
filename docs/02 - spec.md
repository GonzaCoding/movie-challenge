# Frontend Movie Browser — Technical Specification

## 1) Summary & Goals

A React + TypeScript app (bundled with Vite) to **browse movies by category** using TMDB. The **homepage** shows 3 carousels (Popular, Top Rated, Upcoming). Clicking a movie opens a **detail page** with description, poster, and a **category-styled toggle button** to add/remove the movie from a **global wishlist drawer** (accessible from the header). The app supports **SSR (server-render + hydrate)**, **responsive layouts**, **infinite scroll carousels**, **localStorage-persisted wishlist**, and a **clean, maintainable architecture** with testing and code quality tooling.

---

## 2) Tech Stack & Constraints

- **Language:** TypeScript (strict)
- **Framework:** React 18 (no full-stack framework; **no Next.js**)
- **Bundler & Dev Server:** Vite, **with Vite SSR entry points**
- **Routing:** React Router
- **Data Fetching/Caching:** TanStack Query
- **State Management:** Redux (**single slice** combining wishlist + minimal UI state)
- **Styling:** SCSS (BEM naming).
  - **Per-component `.scss` files** + **one global reset**
  - **Global design tokens** via a small `_variables.scss` file (colors, spacing, breakpoints)
- **UI Libraries:** None (custom components).
- **SSR Strategy:** Server renders HTML with data (see section 7), then hydrates on client.
- **Testing:** Jest + React Testing Library (unit + integration; coverage enabled).
- **Lint/Format:** ESLint (default rules) + Prettier (format on save).
- **Env Vars:** `.env` with `VITE_TMDB_API_KEY` and a checked-in `.env.example`.
- **Accessibility:** a11y considered (ARIA roles/labels, focus order); **carousel is mouse/touch; no arrow-key nav**, and the **wishlist drawer is opened via mouse only** (per requirement).

---

## 3) Feature Requirements

### Core

- **Homepage**
  - Fixed header with app title/logo and **Wishlist** button (opens **animated side drawer**).
  - **Three carousels**:
    1. **Popular** _(SSR pre-fetched)_
    2. **Top Rated** _(lazy-loaded on client)_
    3. **Upcoming** _(lazy-loaded on client)_
  - Carousels:
    - Custom-built, horizontal scroll with **arrow buttons (desktop)** and **swipe gestures (mobile)**.
    - **Infinite scroll** (load more pages as the user scrolls horizontally / reaches end).
    - **Smooth transitions** & **hover effects** for cards.
    - **Skeleton loaders** while fetching.
- **Movie Detail Page**
  - Poster image, title, overview/description.
  - **Category-specific styles** (font + button style) for the **Add/Remove Wishlist** toggle.
  - **SSR data prefetch** for details.
  - **Skeleton loader** while hydrating/fetching on client if needed.
  - **Scroll restoration** when navigating back to home.
- **Wishlist Drawer**
  - Accessible from header button anywhere in the app.
  - **Animated slide-in/out**.
  - **Flat list** of saved movies with **poster thumbnail**, title, and **category badge**.
  - Remove button (**X/trash**) per item.
  - **Scrollable** content if overflow.
  - **Persistence:** Redux state synced to **localStorage** (rehydrate on load).
- **Not Found (404) Page**
  - Simple global 404 route/page.

### Non-Goals

- No auth/login.
- No search input (browse only).
- No ratings or related/recommended sections.
- No deployment instructions or CI pipelines.

---

## 4) TMDB Integration

### 4.1 API Key Registration (README step)

1. Create a free TMDB account at `themoviedb.org`.
2. Navigate to settings → API → request a developer key.
3. Create a `.env` file from `.env.example` and set `VITE_TMDB_API_KEY=...`.

### 4.2 Endpoints (examples)

- **Popular**: `/movie/popular`
- **Top Rated**: `/movie/top_rated`
- **Upcoming**: `/movie/upcoming`
- **Details**: `/movie/{movie_id}`
- **Images**: load posters directly from TMDB’s CDN (e.g., `https://image.tmdb.org/t/p/w342{poster_path}`).
  - **Responsive:** use `w185` on mobile, `w342` or `w500` on desktop depending on layout.

> **Note:** Use **TanStack Query** for all API calls. For SSR, prefetch via server and dehydrate to the client.

---

## 5) Data Model (TypeScript Types)

Create a `@types/tmdb.ts` with hand-crafted types (strict TS).

```ts
export type Category = 'popular' | 'top_rated' | 'upcoming';

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  category?: Category; // attach at fetch time for UI badges
}

export interface PagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
}
```

---

## 6) Routing

- `/` → **HomePage**
- `/movie/:id` → **MovieDetailPage**
- `*` → **NotFoundPage**

---

## 7) SSR Strategy (Vite)

- **Server entry (`src/entry-server.tsx`)**:
  - Create a request-scoped **Redux store** and **TanStack Query client**.
  - For **homepage**:
    - **Prefetch only Popular** (first page). **Do not prefetch** Top Rated / Upcoming.
  - For **detail page**:
    - **Prefetch the movie details**.
  - Use `renderToString` (React 18 compatible) to render app within `<StaticRouter>`.
  - Dehydrate TanStack Query cache and **inline** it into HTML for client rehydration.
  - Inline **SEO tags** (title/meta/OG) per route.
- **Client entry (`src/entry-client.tsx`)**:
  - Recreate store & Query client; **rehydrate** from dehydrated state.
  - **Hydrate** the server-rendered markup.
  - Set up **Redux–localStorage** sync for wishlist after hydration.

---

## 8) State Management

- **Redux — single slice** `appSlice`:
  - `wishlist: Record<number, WishlistItem>`
  - `ui: { isWishlistOpen: boolean }`
  - Actions: `toggleWishlistItem(movie)`, `removeWishlistItem(id)`, `openWishlist()`, `closeWishlist()`
- **Persistence:**
  - On app start (client only), **rehydrate** slice from `localStorage`.
  - On slice updates, **serialize** wishlist to `localStorage`.

---

## 9) Data Fetching & Caching (TanStack Query)

- Keys:
  - `['movies', 'popular', page]`
  - `['movies', 'top_rated', page]`
  - `['movies', 'upcoming', page]`
  - `['movie', id]`
- **SSR Prefetch:** `popular` page 1 and `movie/:id` detail.
- **Home lazy load:** Top Rated & Upcoming fetch on client when carousel is in view or when user interacts.
- **Infinite scroll:** Use `useInfiniteQuery` for each carousel.

---

## 10) SEO

Set per-route SEO on the server:

- **Home:** title “Movie Browser — Popular, Top Rated, Upcoming”, meta description explaining browse by categories.
- **Detail:** title `${movie.title} — Movie Details`; description `${movie.overview.slice(0, 150)}…`.
- **OpenGraph:** `og:title`, `og:description`, `og:image` with poster URL.

---

## 11) Error Handling & Recovery

- **Error Boundaries** wrap:
  - Home carousels container
  - Detail page content
  - Wishlist drawer
- **Fetch Errors (TanStack Query):**
  - Show **error panels** with a **Retry** button.
- **Empty States:**
  - Wishlist: friendly empty message.

---

## 12) Performance

- **Route-level code splitting**
- **Lazy load** wishlist drawer
- **Responsive images**
- **Image lazy loading**
- **Memoization**
- **TanStack Query caching**

---

## 13) Accessibility (a11y)

- Semantic structure: header/main/aside.
- Buttons with `aria-label`.
- Drawer uses `role="complementary"` or `aside`.
- Images have meaningful `alt`.
- Color contrast meets AA.
- **Keyboard note:** drawer open via mouse only; carousel nav via mouse/touch only.

---

## 14) Styling (SCSS)

- **BEM naming**
- **Files:**
  - `src/styles/reset.scss`
  - `src/styles/_variables.scss`
  - Component-scoped `.scss`
- **Design tokens:** colors, spacing, breakpoints.
- **Category styles:** in detail page SCSS with modifiers for each category.

---

## 15) Project Structure

```
src/
  app/
    router.tsx
    routes/
      HomePage.tsx
      MovieDetailPage.tsx
      NotFoundPage.tsx
  components/
    Header/
    Carousel/
    MovieCard/
    WishlistDrawer/
    Skeleton/
    ErrorPanel/
  redux/
    store.ts
    appSlice.ts
  queries/
    client.ts
    tmdb.ts
  types/
    tmdb.ts
  utils/
  styles/
    reset.scss
    _variables.scss
  entry-client.tsx
  entry-server.tsx
server/
  index.ts
public/
  favicon.ico
__tests__/
```

---

## 16) Build & Scripts

- `dev`: Vite dev server (SSR enabled)
- `build`: Vite SSR build
- `preview`: run built server
- `test`: Jest
- `test:coverage`: Jest with coverage
- `lint`: ESLint
- `format`: Prettier

---

## 17) Implementation Details

- **HomePage:** SSR prefetch Popular; lazy-load Top Rated & Upcoming. Infinite scroll per category.
- **MovieDetailPage:** SSR prefetch detail; category-based styles; wishlist toggle.
- **WishlistDrawer:** Lazy-loaded, animated slide-in/out, poster+title+badge, remove icon.

---

## 18) Error & Loading UX

- **Skeletons** for carousels and detail pages.
- **ErrorPanel** with Retry.
- **Error Boundaries** with reload fallback.

---

## 19) Testing Plan

- **Unit:** appSlice reducers, utils.
- **Integration:** HomePage loads popular + lazy loads others; DetailPage toggle; WishlistDrawer add/remove.
- **Coverage:** required.
- **Note:** mocked data objects only.

---

## 20) Accessibility Checklist

- Aria labels on buttons.
- Drawer focus return.
- Alt text for posters.
- Contrast checked.

---

## 21) Performance Checklist

- Code splitting + lazy load.
- Responsive + lazy images.
- Query caching tuned.
- Memoization.

---

## 22) Acceptance Criteria

1. Homepage SSR for Popular, lazy load others.
2. Carousels interactive with arrows/swipe/infinite scroll.
3. Detail page SSR + category-specific CTA.
4. Wishlist drawer animated, persists in localStorage, removable items.
5. Global 404 page exists.
6. SEO + a11y included.
7. Tests pass with coverage.
8. Lint/format clean; BEM naming.

---

## 23) Developer “Day 1” Setup

1. `cp .env.example .env` → set `VITE_TMDB_API_KEY`.
2. `npm install`
3. Dev: `npm run dev`
4. Build: `npm run build` → `npm run preview`
5. Tests: `npm run test` / Coverage: `npm run test:coverage`
