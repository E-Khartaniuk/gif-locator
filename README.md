# GIF Locator

A web app for searching and browsing GIFs, built with Angular and the [Giphy API](https://developers.giphy.com/).

**Live demo:** https://e-khartaniuk.github.io/gif-locator/

## Features

- **Search** with debounced input; trending GIFs are shown when the query is empty
- **Pagination** and a **max content rating** filter (G / PG / PG-13 / R)
- **Details dialog** with author, upload date, resolution, file size, rating and source
- **Copy link** to a GIF and **download** it, both from the dialog and directly from a thumbnail
- **Browse in the dialog** with arrow buttons or keyboard (← →), seamlessly crossing page boundaries
- **Shareable state**: query, page, rating and the opened GIF live in the URL, so reload, back/forward
  and shared links all work
- **Loading, error and empty states**: skeleton placeholders, specific error messages with a Retry
  button (rate limit, no connection, other errors)
- **Responsive layout** and keyboard / screen reader friendly controls

## Tech stack

- Angular 22: standalone components, signals, built-in control flow
- RxJS 7
- Angular Material and CDK
- SCSS
- TypeScript 6

## Getting started

Requirements: Node.js 22.22+ or 24+, npm.

```bash
npm install
npm start
```

Open http://localhost:4200.

### Giphy API key

The key is stored in `src/environments/environment.development.ts` (used by `npm start`) and
`src/environments/environment.ts` (used by production builds). To use your own key, create an app at
[developers.giphy.com](https://developers.giphy.com/) and replace `giphyApiKey` in these files.

## Scripts

| Command         | Description                   |
| --------------- | ----------------------------- |
| `npm start`     | Dev server with live reload   |
| `npm run build` | Production build into `dist/` |

## Deployment

Every push to `main` is built and deployed to GitHub Pages by the workflow in
`.github/workflows/deploy.yml`.

## Project structure

```
src/app
├── core/                       App-wide, framework-agnostic building blocks
│   ├── interceptors/           Adds the API key to Giphy requests
│   ├── mappers/                Giphy DTO → app model
│   ├── models/                 Giphy DTOs and app models
│   └── services/               Giphy API client, file download
├── features/gif-search/        The search screen
│   ├── components/             Search bar, GIF details dialog
│   ├── gif-search-page/        Page component (presentation only)
│   └── gif-search-store.ts     Screen state: URL params, data loading, selection
└── shared/                     Reusable UI: GIF card, status message, file size pipe
```

## Architecture and decisions

**URL as the single source of truth.** Components never call the API directly. User actions (search,
page change, rating, opening a GIF) only update query params; the store reacts to the URL and loads
data. Reload, back/forward and shared links work without extra code.

**Signal-based store instead of NgRx.** `GifSearchStore` is provided by the page component, so it lives
and dies with the screen. It turns URL params into an RxJS stream (`switchMap` cancels outdated
requests) and exposes the result as signals and `computed` values. For a single screen this gives the
benefits of a store without NgRx boilerplate. The dialog receives the page injector, so it shares the
same store instance.

**DTO → mapper → model.** Giphy responses are typed as DTOs and mapped into the app's own `Gif` model
(numbers instead of numeric strings, `Date` instead of a custom date string, `null` for missing
authors). Components do not depend on the Giphy response format.

**API key interceptor.** A functional `HttpInterceptorFn` adds `api_key` only to requests to the Giphy
API, so it never leaks to other hosts (for example, media downloads).

**Downloading via Blob.** `<a download>` is ignored for cross-origin URLs, so the GIF is fetched as a
Blob (Giphy media allows CORS), saved through a temporary object URL, and the URL is revoked afterwards.

**Smart and presentational components.** The page and the store own data and logic; `GifCard`,
`SearchBar` and `StatusMessage` only receive inputs and emit outputs.

## Known limitations

- **The API key is visible in the browser.** Any client-side key is public. In production, requests
  should go through a backend proxy that keeps the key secret.
- **Rate limit.** Giphy beta keys are limited to about 100 requests per hour. When the limit is reached,
  the app shows a "Too many requests" message.
- **Result cap.** Giphy does not return results beyond offset 4999, so pagination stops at that point.

## Possible improvements

- Unit tests for the mapper, interceptor, API service and store; e2e tests with Playwright
- Localization (EN / UK) together with Giphy's `lang` search parameter
- Caching of already loaded pages
- Infinite scroll as an alternative to pagination
