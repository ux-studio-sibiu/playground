# playground

A single-page portfolio + sandbox for UI experiments. Intentionally low-tech under the hood — no bundler, no framework — to keep iteration fast and the source legible.

## Tech

- **Vanilla JS + jQuery 2.1** for behaviour
- **Velocity.js 1.2** for the section transition engine
- **Sass** (Dart `sass --watch`) → single `css/bundled.css`
- **Bootstrap 3** as base grid/utilities
- **Custom 70-line `build.js`** for HTML partials — no Gulp/Webpack/Vite
- Cross-origin iframes hosting standalone experiments (Vue/Nuxt on Vercel)

## Interesting patterns

- **Token-replace partial system** ([build.js](build.js)) — a hard-coded `INCLUDES` array maps `@@include('partials/x.html')` tokens to files. Two passes resolve nested includes; tokens inside HTML comments are skipped via a single combined regex. `bodyOnly` strips `<html>`/`<head>`/`<body>` when embedding a full document (e.g. the CV).
- **Scroll-hijacking engine** ([js/page-scroll-effects/bundled.js](js/page-scroll-effects/bundled.js)) — wheel/key/nav inputs all funnel through a single `goToSection(target)` that animates outgoing + incoming sections and force-snaps every other section to its correct off-screen state. Keyboard and scroll paths delegate to it instead of duplicating logic — fixed a class of "stuck black page" bugs caused by stalled Velocity callbacks.
- **iframe → parent crossfade** ([src/partials/experiment-zoom.html](src/partials/experiment-zoom.html)) — the Vue iframe `postMessage`s a payload string; the parent maps it to a CSS class (`zoom-payload-bk5` etc.). Backgrounds crossfade smoothly via two stacked `.bg-layer` divs whose `.is-visible` is toggled — `background-image` itself isn't animatable, so opacity does the work.
- **Self-contained partials** — each section partial owns its own `<script>` and `<style>` where it makes sense (e.g. zoom-iframe). Repetition is preferred over threading config through globals.
- **`loading` body class as a render gate** — heavy hero assets (intro image, static video overlay) are loaded eagerly; CSS rules under `body.loading` keep them hidden/dimmed until JS removes the class, at which point pure-CSS transitions (e.g. `transition: opacity 2s ease`) take over.

## Build

```
npm run dev            # dev server + html/sass watch
node build.js          # one-shot HTML build
node build.js --watch  # rebuild HTML on change
npm run sass           # watch & compile css/bundled.scss
```

Output is `index.html` at the repo root, assembled from `src/index.html` and the partials in `src/partials/`.

## Adding a new partial

1. Create `src/partials/your-partial.html`.
2. Add `@@include('partials/your-partial.html')` where you want it in `src/index.html`.
3. Register it in the `INCLUDES` array near the top of [build.js](build.js):

```js
{ token: "@@include('partials/your-partial.html')", file: 'src/partials/your-partial.html' },
```

For partials that themselves contain a full HTML document (e.g. a CV file), add `bodyOnly: true` to inline only the `<body>` content.
