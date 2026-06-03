# Liverpool FC Success Dashboard (1892 - 2026)

A premium, interactive single-page web dashboard tracking Liverpool Football Club's complete success history from their founding year in **1892** to **2026** (123 competitive seasons). 

Built using vanilla HTML5, CSS3, and JavaScript, the codebase is lightweight, zero-dependency (other than Chart.js loaded via CDN), and optimized for instant loading and fully responsive visual storytelling.

---

## 🏆 Live View

To run this dashboard locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/Stepphenwolf2021/liverpool-success-dashboard.git
   cd liverpool-success-dashboard
   ```
2. Run a local development server (e.g., Python's built-in HTTP server):
   ```bash
   python3 -m http.server 8000
   ```
3. Open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## ✨ Features

### 1. Digital Trophy Cabinet & All-Time Stats
* **Interactive Counter Widgets:** Key metrics (68 Total Trophies, 8,419 Goals Scored, 4,816 Matches Played, 48.7% Win Rate) animate smoothly from zero upon loading.
* **Trophy Cabinet:** Showcases all 68 trophies won in club history. Interactive cards glow dynamically in gold, crimson, or blue depending on the silverware category.

### 2. Era-Filterable Performance Trends (Chart.js)
Three interactive, responsive charts built with Chart.js:
* **Era Filters:** Easily filter datasets by historical periods (All-Time, 1892-1939, 1946-1985, 1985-2004, 2004-2026) to adjust density and scale.
* **League Finishes:** Inverted line chart showing final league standings (1st at the top), color-coded by manager era (e.g., emerald green for Slot, lime green for Paisley).
* **Points Tracker:** Vertical bar chart displaying total seasonal points.
* **Goals Analysis:** Double-bar chart comparing Goals For (GF) vs. Goals Against (GA).

### 3. Season-by-Season Explorer
* **Timeline Slider:** Slide through 123 seasons to dynamically update league standing details, goal differences, manager names, top goalscorers, and historical narrative summaries.
* **Cup Performance Table:** Visual breakdown of results in the FA Cup, EFL Cup, Champions League, Europa League, and minor/super cups for every season.

### 4. Manager Eras Analysis
* Compare 21 manager tenures (from Barclay/McKenna in 1892 to Arne Slot in 2026).
* Review win rates, average league finishes, matches managed, and specific trophies won.
* Defaults to Jürgen Klopp's legendary era.

### 5. Historical Milestones Timeline
* A vertical interactive timeline highlighting pivotal events in club history, from founding and early titles to European triumphs and modern domestic success.

---

## 🛠️ Technology Stack
* **Markup:** HTML5 (Semantic Structure)
* **Styles:** CSS3 (Custom design system, glassmorphism, responsive grid layouts, and glow animations)
* **Scripting:** Pure ES6 Javascript
* **Charts:** Chart.js (v4.4.2 via CDN)
