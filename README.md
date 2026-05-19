# playground

## Build

```
node build.js          # single build
node build.js --watch  # rebuild on file change
npm run dev            # dev server + watch
```

Output is `index.html` at the repo root, assembled from `src/index.html` and the partials in `src/partials/`.

## Adding a new partial

1. Create the file in `src/partials/your-partial.html`.
2. Add `@@include('partials/your-partial.html')` where you want it in `src/index.html`.
3. Register it in the `INCLUDES` array near the top of `build.js`:

```js
{ token: "@@include('partials/your-partial.html')", file: 'src/partials/your-partial.html' },
```

For partials that themselves include a full HTML document (e.g. a CV file), add `bodyOnly: true` to strip the `<html>`/`<head>`/`<body>` wrapper and inline only the body content.
