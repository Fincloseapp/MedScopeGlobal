# MedScopeGlobal

Professional medical portal built with React, Vite and TypeScript.

## Features

- Sticky click-based navigation with locale-aware routes.
- Supported language prefixes: `/en/`, `/cs/`, `/de/`, `/pl/`.
- Automatic language selection from `localStorage.language`, `navigator.languages`, `navigator.language` and server-provided `Accept-Language` metadata.
- AI Content Engine with live source adapters, local caching, scheduled refresh and placeholder fallback.
- Homepage sections for professional content, research, economics, digital health, pharma, news, congresses, careers, students, credibility and subscription.
- Fulltext search and a research submission form.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

## Content refresh

The browser refreshes cached content on a schedule. The repository also includes a GitHub Actions workflow and script:

```bash
npm run refresh:content
```
