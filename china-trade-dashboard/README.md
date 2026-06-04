# China Trade Dashboard

An interactive, single-file premium dashboard tracking China's exports, imports, trade balance, top trading partners, top product categories, and key trade-policy events — covering the last 10 years (2016–2025).

Built in the same style as the Liverpool Success Dashboard: a self-contained `index.html` with no build step, a dark/light theme toggle, tabbed navigation, and interactive [Chart.js](https://www.chartjs.org/) visualisations.

## Features

- **Overview** — headline stat cards (total trade, exports, imports, surplus) and an exports-vs-imports line chart.
- **Trade Trends** — annual exports/imports bars, trade-balance trend, and year-on-year export growth.
- **Partners & Products** — top export partners, top export/import categories, and the product mix.
- **Key Events** — a vertical timeline of recent milestones (US–China trade war, Phase One deal, RCEP, recent tariff rounds, 2025 truce).
- **Sources** — every data point is traceable: each card carries an inline "Source [n]" link, and the Sources tab lists all references and exactly what each one backs up.

## Run it

Just open `index.html` in any browser. No server or build required. Chart.js loads from a CDN, so an internet connection is needed for the charts to render.

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repository.
2. In the repo: **Settings → Pages → Build and deployment**, set **Source = Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Your dashboard goes live at `https://<username>.github.io/<repo>/`.

## Data & sources

Figures are approximate and on a goods/customs basis unless noted, compiled from China's General Administration of Customs, the World Bank, the Observatory of Economic Complexity (OEC), and trade-press reporting (as of early 2026). Headline 2025 figures: total trade ≈ US$6.36T, exports ≈ US$3.77T, imports ≈ US$2.65T, surplus ≈ US$1.19T.

All data lives in plain JavaScript objects near the bottom of `index.html` (the `years`, `partners`, `exportCats`, `timeline`, etc. arrays) — edit those to update the dashboard.

## License

Demo project — free to reuse and adapt.
