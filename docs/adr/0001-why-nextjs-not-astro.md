# ADR-0001: Use Next.js instead of Astro

**Status**: Accepted
**Date**: 2026-06-28

## Context

The public link page must render with near-zero client-side JavaScript for maximum
performance (target: <300ms FCP, <50KB page weight). Both Astro and Next.js
can achieve this via Server Components / Static HTML.

The admin dashboard, however, requires client-side interactivity (drag-and-drop,
live preview, charts). This needs a client-side framework.

## Decision

Use **Next.js 16** (App Router) for both the public page and admin dashboard.

## Rationale

- **One codebase**: Next.js Server Components render the public page as pure HTML
  (no client-side JS bundles — no React runtime) while the admin dashboard uses client components. No need to
  maintain two separate projects.
- **Contributor accessibility**: React has the largest contributor pool. More
  developers can contribute to a Next.js project than Astro.
- **shadcn/ui ecosystem**: The UI component library depends on React.
- **ISR (Incremental Static Regeneration)**: Public pages are cached and
  revalidate automatically when the admin changes links.
- **95% of Astro's performance**: Next.js RSC ships no React runtime to the
  public page. The React runtime only loads on admin routes, not the public page.

## Alternatives Considered

- **Astro**: Marginally faster public page (truly zero React runtime), but
  requires a separate codebase for the admin panel. Two codebases = harder
  for contributors, worse DX, more complex docs.
- **SvelteKit**: Growing but 10x smaller contributor pool than React.
- **Remix**: Good full-stack option, but Next.js has better ecosystem support
  for self-hosting (standalone output, Docker optimization).
