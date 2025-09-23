# Code Generation Prompts

Use these prompts sequentially with a code-generation LLM. Each builds on the previous and wires code together. No orphaned code.

---

### Prompt 01 — Initialize Vite + SSR skeleton
```text
Create a Vite React TypeScript project and add SSR entries...
```

### Prompt 02 — Router & App shell
```text
Add routing and a basic App shell...
```

### Prompt 03 — ESLint + Prettier + path aliases
```text
Configure lint/format and clean imports...
```

### Prompt 04 — Jest + RTL + coverage
```text
Set up Jest with React Testing Library and coverage...
```

### Prompt 05 — Redux store (single slice) + persistence
```text
Create Redux store and single app slice with localStorage persistence...
```

### Prompt 06 — TanStack Query + SSR dehydration glue
```text
Add React Query and dehydration...
```

### Prompt 07 — SCSS variables, BEM, and base utils
```text
Establish styling foundation...
```

### Prompt 08 — TMDB types & fetcher
```text
Implement TMDB types and fetch utilities...
```

### Prompt 09 — MovieCard + responsive images
```text
Create MovieCard component...
```

### Prompt 10 — Skeleton & ErrorPanel
```text
Create loading and error components...
```

### Prompt 11 — HomePage: SSR prefetch Popular (page 1)
```text
Wire Popular SSR...
```

### Prompt 12 — Carousel component (structure + arrows)
```text
Build Carousel shell...
```

### Prompt 13 — useCarousel hook (infinite & controls)
```text
Add hook for scroll logic and sentinel...
```

### Prompt 14 — Infinite Query for Popular
```text
Switch Popular to useInfiniteQuery...
```

### Prompt 15 — Lazy Top Rated & Upcoming rows
```text
Add the two remaining carousels...
```

### Prompt 16 — Swipe gestures (mobile)
```text
Add touch/pointer swipe...
```

### Prompt 17 — Navigation from cards
```text
Enable clicking a card to open detail...
```

### Prompt 18 — Detail route SSR + SEO
```text
Implement server prefetch and SEO for details...
```

### Prompt 19 — Category fonts & CTA styles
```text
Style-per-category on detail page...
```

### Prompt 20 — Wishlist toggle
```text
Hook detail CTA to Redux...
```

### Prompt 21 — Scroll restoration
```text
Restore scroll on back navigation...
```

### Prompt 22 — Wishlist Drawer (lazy)
```text
Create the drawer component and lazy-load it...
```

### Prompt 23 — Persistence polish
```text
Ensure Redux ↔ localStorage works fully...
```

### Prompt 24 — Error boundaries & retry
```text
Add safety nets...
```

### Prompt 25 — Performance tune
```text
Polish performance...
```

### Prompt 26 — 404 page & header polish
```text
Finalize global 404 and header...
```

### Prompt 27 — Unit tests
```text
Write unit tests...
```

### Prompt 28 — Integration tests
```text
Write integration tests with mocked data...
```

### Prompt 29 — README & .env.example
```text
Add minimal documentation and env sample...
```

### Prompt 30 — Final pass (a11y & code tidy)
```text
Do a final pass...
```
