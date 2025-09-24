# Movie Browser Project Plan

## A. High-Level Blueprint (Phases)

1. **Bootstrap & Tooling**

- Vite (React + TS) with SSR entries and Node server
- React Router, Redux, TanStack Query
- SCSS with reset + per-component files
- ESLint + Prettier; Jest + RTL; path aliases
- .env.example

2. **Home (SSR Popular)**

- TMDB client & query keys
- SSR prefetch Popular page 1
- HomePage with Popular Carousel
- Header

3. **Top Rated & Upcoming**

- Lazy-load client rows
- Infinite scroll carousels
- Arrows + swipe; hover effects

4. **Movie Detail (SSR)**

- Detail route SSR
- Category-specific font + CTA styles
- Wishlist toggle; scroll restoration

5. **Wishlist Drawer**

- Lazy-loaded side drawer
- Animated; poster + title + badge
- Redux sync with localStorage

6. **Error Boundaries, A11y, SEO, Perf**

- Error boundaries, retry
- Responsive images; memoize; code-splitting

7. **Tests & Docs**

- Unit + integration tests
- README + .env.example

---

## B. Iterative Chunks → Tasks → Micro-Steps

(Detailed breakdown of chunks 0–6, micro-steps for each as described in the conversation)

---

## C. Prompts for Code-Generation LLM

See prompts.md
