// app.js - Main dashboard functionality and state manager

// Check and apply theme preference instantly before rendering layout
const savedTheme = localStorage.getItem("lfc_dashboard_theme") || "dark";
if (savedTheme === "light") {
  document.body.classList.add("light-theme");
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initCounters();
  initCharts();
  initSeasonExplorer();
  initManagerEras();
  initSquadBuilder();
  initFanPoll();
  initTwitterFeed();
  initPredictorSystem();
  initThemeToggle(); // Initialize theme button and styles
  initNewsletterSubscribe(); // Initialize email newsletter & suggestions form
  initWallpaperPreview(); // Initialize wallpaper download preview lightbox
});

// 1. SPA TABS NAVIGATION
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = document.querySelectorAll(".tab-content");

  const tabMap = {
    "#overview": { sectionId: "overview-section", tabId: "tab-overview" },
    "#seasons": { sectionId: "seasons-section", tabId: "tab-seasons" },
    "#managers": { sectionId: "managers-section", tabId: "tab-managers" },
    "#squad": { sectionId: "squad-section", tabId: "tab-squad" },
    "#moments": { sectionId: "moments-section", tabId: "tab-moments" },
    "#news": { sectionId: "news-section", tabId: "tab-news" },
    "#predictor": { sectionId: "predictor-section", tabId: "tab-predictor" }
  };

  const switchTab = (hash) => {
    const activeRoute = tabMap[hash] || tabMap["#overview"];
    
    // Remove active from all tabs
    tabs.forEach(t => t.classList.remove("active"));
    // Hide all contents
    contents.forEach(c => c.classList.remove("active"));

    // Add active to current tab button
    const targetTabBtn = document.getElementById(activeRoute.tabId);
    if (targetTabBtn) targetTabBtn.classList.add("active");

    // Show matching content
    const targetContent = document.getElementById(activeRoute.sectionId);
    if (targetContent) targetContent.classList.add("active");

    // Specific triggers for chart and twitter widget load
    if (activeRoute.sectionId === "overview-section") {
      window.dispatchEvent(new Event('resize'));
    }

    if (activeRoute.sectionId === "news-section" && window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  };

  // Change hash when a tab is clicked
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const dataTab = tab.getAttribute("data-tab");
      // Find matching hash
      const matchedHash = Object.keys(tabMap).find(key => tabMap[key].sectionId === dataTab);
      if (matchedHash) {
        window.location.hash = matchedHash;
      }
    });
  });

  // Listen to hash change
  window.addEventListener("hashchange", () => {
    switchTab(window.location.hash);
  });

  // Initialize on load
  const initialHash = window.location.hash;
  if (initialHash && tabMap[initialHash]) {
    switchTab(initialHash);
  } else {
    // If no hash or invalid hash, default to #overview
    switchTab("#overview");
    if (!initialHash) {
      // Replace state to avoid adding history entry on boot
      history.replaceState(null, null, "#overview");
    }
  }
}

// 2. ANIMATED NUMERICAL COUNTERS
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  const speed = 200; // lower is faster

  const runCounter = (counter) => {
    const target = +counter.getAttribute("data-target");
    let count = 0;
    
    // Smooth increment
    const increment = Math.max(1, Math.ceil(target / speed));

    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.innerText = count;
        setTimeout(updateCount, 1);
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  };

  // IntersectionObserver to start counting only when visible
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(counter => observer.observe(counter));
}

// 3. CHART.JS VISUALIZATIONS
let positionsChartInst, pointsChartInst, goalsChartInst;
let currentFilteredData = seasonsData;

// Color map for manager eras to visually categorize charts
const managerColors = {
  "W. E. Barclay / John McKenna": "rgba(244, 63, 94, 0.85)", // Pink-red
  "Tom Watson": "rgba(217, 70, 239, 0.85)", // Magenta
  "David Ashworth": "rgba(139, 92, 246, 0.85)", // Indigo
  "David Ashworth / Matt McQueen": "rgba(139, 92, 246, 0.85)",
  "Matt McQueen": "rgba(99, 102, 241, 0.85)", // Lavender
  "George Patterson": "rgba(59, 130, 246, 0.85)", // Blue
  "George Kay": "rgba(14, 165, 233, 0.85)", // Light Blue
  "Don Welsh": "rgba(6, 182, 212, 0.85)", // Cyan
  "Phil Taylor": "rgba(20, 184, 166, 0.85)", // Teal
  "Phil Taylor / Bill Shankly": "rgba(16, 185, 129, 0.85)",
  "Bill Shankly": "rgba(34, 197, 94, 0.85)", // Green
  "Bob Paisley": "rgba(132, 204, 22, 0.85)", // Lime
  "Joe Fagan": "rgba(234, 179, 8, 0.85)", // Gold
  "Kenny Dalglish / Graeme Souness": "rgba(249, 115, 22, 0.85)",
  "Kenny Dalglish": "rgba(249, 115, 22, 0.85)", // Orange
  "Graeme Souness": "rgba(239, 68, 68, 0.85)", // Red
  "Graeme Souness / Roy Evans": "rgba(239, 68, 68, 0.85)",
  "Roy Evans": "rgba(244, 63, 94, 0.85)", // Light Pink
  "Roy Evans / Gérard Houllier": "rgba(168, 85, 247, 0.85)",
  "Gérard Houllier": "rgba(168, 85, 247, 0.85)", // Purple
  "Rafael Benítez": "rgba(59, 130, 246, 0.85)",  // Blue
  "Roy Hodgson / Kenny Dalglish": "rgba(107, 114, 128, 0.85)", // Gray
  "Kenny Dalglish (2nd)": "rgba(107, 114, 128, 0.85)",
  "Brendan Rodgers": "rgba(234, 179, 8, 0.85)",  // Yellow
  "Brendan Rodgers / Jürgen Klopp": "rgba(227, 27, 35, 0.85)", // Transition
  "Jürgen Klopp": "rgba(227, 27, 35, 0.85)",     // Crimson Red
  "Arne Slot": "rgba(16, 185, 129, 0.85)",        // Emerald Green
  "Andoni Iraola": "rgba(14, 165, 233, 0.85)"      // Cyan/Light Blue
};

function getFilteredData(range) {
  if (range === "pre-war") {
    return seasonsData.filter(s => {
      const year = parseInt(s.season.split('–')[0]);
      return year < 1939;
    });
  } else if (range === "golden-era") {
    return seasonsData.filter(s => {
      const year = parseInt(s.season.split('–')[0]);
      return year >= 1946 && year < 1985;
    });
  } else if (range === "dalglish-houllier") {
    return seasonsData.filter(s => {
      const year = parseInt(s.season.split('–')[0]);
      return year >= 1985 && year < 2004;
    });
  } else if (range === "modern-era") {
    return seasonsData.filter(s => {
      const year = parseInt(s.season.split('–')[0]);
      return year >= 2004;
    });
  }
  return seasonsData; // "all"
}

function initCharts() {
  const ctxPos = document.getElementById("positionsChart").getContext("2d");
  const ctxPts = document.getElementById("pointsChart").getContext("2d");
  const ctxGls = document.getElementById("goalsChart").getContext("2d");

  // Default to "all" on load
  currentFilteredData = seasonsData;
  const seasonsLabels = currentFilteredData.map(s => s.season);
  const pointColors = currentFilteredData.map(s => managerColors[s.manager] || "rgba(255, 255, 255, 0.8)");

  // --- Chart 1: Premier League/Division 1 Positions (Inverted Line Chart) ---
  positionsChartInst = new Chart(ctxPos, {
    type: "line",
    data: {
      labels: seasonsLabels,
      datasets: [{
        label: "Finish Position",
        data: currentFilteredData.map(s => s.pos),
        borderColor: "rgba(227, 27, 35, 0.6)",
        borderWidth: 2,
        pointBackgroundColor: pointColors,
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
        tension: 0.15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          reverse: true, // Invert scale: 1st is top, worst is bottom
          min: 0.2, // Expanded top area above 1st position for breathing room
          max: 22, // Set to standard max size of English first division
          ticks: {
            stepSize: 2,
            color: "#cccccc",
            font: { family: "Inter", weight: 600 },
            callback: function(value) {
              const suffixes = ["st", "nd", "rd", "th"];
              return value + (suffixes[value - 1] || "th");
            }
          },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          afterBuildTicks: function(scale) {
            const allTicks = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
            scale.ticks = allTicks
              .filter(v => v <= scale.max)
              .map(v => ({ value: v }));
          }
        },
        x: {
          ticks: {
            color: "#cccccc",
            font: { family: "Inter" },
            maxRotation: 45,
            minRotation: 45,
            callback: function(val, index) {
              // Only display every 5th label to prevent overlapping on all-time view
              return index % 5 === 0 ? this.getLabelForValue(val) : '';
            }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1c1c1c",
          titleColor: "#E3D4AD",
          titleFont: { family: "Montserrat", weight: "bold" },
          bodyColor: "#ffffff",
          bodyFont: { family: "Inter" },
          borderColor: "rgba(227, 27, 35, 0.3)",
          borderWidth: 1,
          callbacks: {
            title: function(context) {
              return `Season ${context[0].label}`;
            },
            label: function(context) {
              const seasonObj = currentFilteredData[context.dataIndex];
              const pos = context.raw;
              const suffix = ["st", "nd", "rd", "th"][pos-1] || "th";
              return [
                `Finish: ${pos}${suffix} (${seasonObj.division})`,
                `Points: ${seasonObj.pts}`,
                `Manager: ${seasonObj.manager}`,
                seasonObj.majorTrophies.length > 0 ? `🏆 Trophies: ${seasonObj.majorTrophies.join(", ")}` : "Trophies: None"
              ];
            }
          }
        }
      }
    }
  });

  // --- Chart 2: Points Trend (Bar Chart) ---
  pointsChartInst = new Chart(ctxPts, {
    type: "bar",
    data: {
      labels: seasonsLabels,
      datasets: [{
        label: "Points Accumulated",
        data: currentFilteredData.map(s => s.pts),
        backgroundColor: pointColors,
        borderRadius: 3,
        hoverBackgroundColor: "rgba(255, 255, 255, 0.9)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: "#cccccc",
            font: { family: "Inter" }
          },
          grid: { color: "rgba(255, 255, 255, 0.05)" }
        },
        x: {
          ticks: {
            color: "#cccccc",
            font: { family: "Inter" },
            maxRotation: 45,
            minRotation: 45,
            callback: function(val, index) {
              return index % 5 === 0 ? this.getLabelForValue(val) : '';
            }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1c1c1c",
          titleColor: "#E3D4AD",
          titleFont: { family: "Montserrat", weight: "bold" },
          bodyColor: "#ffffff",
          borderColor: "rgba(227, 27, 35, 0.3)",
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const seasonObj = currentFilteredData[context.dataIndex];
              return [
                `Total Points: ${context.raw}`,
                `Record: ${seasonObj.won}W - ${seasonObj.drawn}D - ${seasonObj.lost}L`,
                `Manager: ${seasonObj.manager}`
              ];
            }
          }
        }
      }
    }
  });

  // --- Chart 3: Goals For vs Goals Against (Grouped Bar Chart) ---
  goalsChartInst = new Chart(ctxGls, {
    type: "bar",
    data: {
      labels: seasonsLabels,
      datasets: [
        {
          label: "Goals Scored (GF)",
          data: currentFilteredData.map(s => s.gf),
          backgroundColor: "rgba(227, 27, 35, 0.75)",
          borderColor: "rgba(227, 27, 35, 1)",
          borderWidth: 1,
          borderRadius: 2
        },
        {
          label: "Goals Conceded (GA)",
          data: currentFilteredData.map(s => s.ga),
          backgroundColor: "rgba(30, 58, 138, 0.7)",
          borderColor: "rgba(30, 58, 138, 1)",
          borderWidth: 1,
          borderRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: { color: "#cccccc", font: { family: "Inter" } },
          grid: { color: "rgba(255, 255, 255, 0.05)" }
        },
        x: {
          ticks: {
            color: "#cccccc",
            font: { family: "Inter" },
            maxRotation: 45,
            minRotation: 45,
            callback: function(val, index) {
              return index % 5 === 0 ? this.getLabelForValue(val) : '';
            }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#ffffff",
            font: { family: "Montserrat", weight: 600 }
          }
        },
        tooltip: {
          backgroundColor: "#1c1c1c",
          bodyColor: "#ffffff",
          borderColor: "rgba(227, 27, 35, 0.3)",
          borderWidth: 1,
          callbacks: {
            afterBody: function(context) {
              const index = context[0].dataIndex;
              const diff = currentFilteredData[index].gf - currentFilteredData[index].ga;
              return `Goal Difference: ${diff > 0 ? '+' : ''}${diff}`;
            }
          }
        }
      }
    }
  });

  // Attach event listeners for filtering
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const range = btn.getAttribute("data-range");
      updateCharts(range);
    });
  });
}

function updateCharts(range) {
  currentFilteredData = getFilteredData(range);
  const labels = currentFilteredData.map(s => s.season);
  const pointColors = currentFilteredData.map(s => managerColors[s.manager] || "rgba(255, 255, 255, 0.8)");
  const showEveryLabel = range !== "all"; // Show more labels if range is smaller

  // Update Positions Chart
  positionsChartInst.data.labels = labels;
  positionsChartInst.data.datasets[0].data = currentFilteredData.map(s => s.pos);
  positionsChartInst.data.datasets[0].pointBackgroundColor = pointColors;
  
  // Dynamic Y-axis scale based on worst position in the filtered set
  const maxPos = Math.max(8, ...currentFilteredData.map(s => s.pos));
  positionsChartInst.options.scales.y.max = maxPos;
  
  // Custom X-axis label filtering
  positionsChartInst.options.scales.x.ticks.callback = function(val, index) {
    if (showEveryLabel) {
      return index % 2 === 0 ? this.getLabelForValue(val) : '';
    }
    return index % 5 === 0 ? this.getLabelForValue(val) : '';
  };
  positionsChartInst.update();

  // Update Points Chart
  pointsChartInst.data.labels = labels;
  pointsChartInst.data.datasets[0].data = currentFilteredData.map(s => s.pts);
  pointsChartInst.data.datasets[0].backgroundColor = pointColors;
  
  const maxPts = Math.max(10, ...currentFilteredData.map(s => s.pts));
  const minPts = Math.min(...currentFilteredData.map(s => s.pts));
  pointsChartInst.options.scales.y.max = Math.min(100, Math.ceil(maxPts / 10) * 10 + 5);
  pointsChartInst.options.scales.y.min = Math.max(0, Math.floor(minPts / 10) * 10 - 5);
  
  pointsChartInst.options.scales.x.ticks.callback = function(val, index) {
    if (showEveryLabel) {
      return index % 2 === 0 ? this.getLabelForValue(val) : '';
    }
    return index % 5 === 0 ? this.getLabelForValue(val) : '';
  };
  pointsChartInst.update();

  // Update Goals Chart
  goalsChartInst.data.labels = labels;
  goalsChartInst.data.datasets[0].data = currentFilteredData.map(s => s.gf);
  goalsChartInst.data.datasets[1].data = currentFilteredData.map(s => s.ga);
  
  goalsChartInst.options.scales.x.ticks.callback = function(val, index) {
    if (showEveryLabel) {
      return index % 2 === 0 ? this.getLabelForValue(val) : '';
    }
    return index % 5 === 0 ? this.getLabelForValue(val) : '';
  };
  goalsChartInst.update();
}

// 4. SEASON-BY-SEASON EXPLORER
function initSeasonExplorer() {
  const slider = document.getElementById("timeline-slider");
  const yearsContainer = document.getElementById("timeline-years-indicators");

  // Populate indicator buttons
  seasonsData.forEach((season, index) => {
    const btn = document.createElement("button");
    btn.className = "t-year-btn";
    btn.innerText = season.season;
    btn.dataset.index = index;
    
    btn.addEventListener("click", () => {
      slider.value = index;
      updateExplorer(index);
    });

    yearsContainer.appendChild(btn);
  });

  // Slider change event
  slider.addEventListener("input", (e) => {
    updateExplorer(parseInt(e.target.value));
  });

  // Initialize display with last index (2025-26 season)
  updateExplorer(parseInt(slider.value));
}

function updateExplorer(index) {
  const data = seasonsData[index];
  
  // Update year buttons active status
  const buttons = document.querySelectorAll(".t-year-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    if (parseInt(btn.dataset.index) === index) {
      btn.classList.add("active");
      // Scroll active button into view inside timeline container if overflowed
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  // Update DOM Elements
  document.getElementById("explorer-season-title").innerText = data.season;
  document.getElementById("explorer-season-pos").innerText = formatPosition(data.pos);
  
  // Style position badge based on finish
  const posBadge = document.getElementById("explorer-season-pos");
  if (data.pos === 1) {
    posBadge.style.background = "var(--gold-primary)";
    posBadge.style.color = "#0a0304";
    posBadge.style.boxShadow = "0 0 15px var(--gold-glow)";
  } else {
    posBadge.style.background = "var(--crimson-primary)";
    posBadge.style.color = "var(--text-primary)";
    posBadge.style.boxShadow = "0 0 15px var(--crimson-glow)";
  }

  document.getElementById("explorer-pts").innerText = data.pts;
  document.getElementById("explorer-record").innerText = `${data.won} - ${data.drawn} - ${data.lost}`;
  document.getElementById("explorer-goals").innerText = `${data.gf} / ${data.ga}`;
  
  const gdVal = data.gf - data.ga;
  document.getElementById("explorer-gd").innerText = (gdVal > 0 ? "+" : "") + gdVal;
  document.getElementById("explorer-manager").innerText = data.manager;
  document.getElementById("explorer-scorer").innerText = `${data.topScorer} (${data.topScorerGoals} goals)`;

  // Narrative
  document.getElementById("explorer-narrative").innerText = data.highlight;
  document.getElementById("trophy-season-label").innerText = data.season;

  // Cup Runs
  document.getElementById("cup-fa").innerText = formatCupResult(data.faCup);
  document.getElementById("cup-efl").innerText = formatCupResult(data.leagueCup);
  document.getElementById("cup-ucl").innerText = formatCupResult(data.championsLeague);
  document.getElementById("cup-europa").innerText = formatCupResult(data.europaLeague);
  
  // Combine other cups / community shields
  let otherText = "—";
  let otherList = [];
  if (data.commShield !== "—") otherList.push(`Comm. Shield: ${data.commShield}`);
  if (data.superCup && data.superCup !== "—") otherList.push(`Super Cup: ${data.superCup}`);
  if (data.clubWorldCup && data.clubWorldCup !== "—") otherList.push(`Club World Cup: ${data.clubWorldCup}`);
  
  if (otherList.length > 0) {
    otherText = otherList.join(", ");
  }
  document.getElementById("cup-other").innerText = otherText;

  // Populating Trophy Cabinet inside the Explorer
  const trophyContainer = document.getElementById("explorer-trophies-container");
  trophyContainer.innerHTML = "";
  
  // Major trophies mapping
  let hasTrophy = false;
  
  if (data.pos === 1) {
    addTrophyBadge("Premier League Winner 🏆", trophyContainer, false);
    hasTrophy = true;
  }
  if (data.championsLeague === "Winner") {
    addTrophyBadge("Champions League Winner 🏆", trophyContainer, false);
    hasTrophy = true;
  }
  if (data.faCup === "Winner") {
    addTrophyBadge("FA Cup Winner 🏆", trophyContainer, true);
    hasTrophy = true;
  }
  if (data.leagueCup === "Winner") {
    addTrophyBadge("League Cup Winner 🏆", trophyContainer, true);
    hasTrophy = true;
  }
  if (data.europaLeague === "Winner") {
    addTrophyBadge("UEFA Cup Winner 🏆", trophyContainer, false);
    hasTrophy = true;
  }
  if (data.commShield === "Winner") {
    addTrophyBadge("Community Shield 🛡️", trophyContainer, true);
    hasTrophy = true;
  }
  if (data.superCup === "Winner") {
    addTrophyBadge("UEFA Super Cup 🏆", trophyContainer, false);
    hasTrophy = true;
  }
  if (data.clubWorldCup === "Winner") {
    addTrophyBadge("Club World Cup 🏆", trophyContainer, false);
    hasTrophy = true;
  }

  if (!hasTrophy) {
    const noTrophiesSpan = document.createElement("span");
    noTrophiesSpan.className = "estat-value";
    noTrophiesSpan.style.color = "var(--text-muted)";
    noTrophiesSpan.style.fontSize = "13px";
    noTrophiesSpan.innerText = "No trophies won this season.";
    trophyContainer.appendChild(noTrophiesSpan);
  }
}

function addTrophyBadge(text, parentElement, isDomestic) {
  const badge = document.createElement("div");
  badge.className = `e-trophy-badge ${isDomestic ? 'shield-badge' : ''}`;
  badge.innerText = text;
  parentElement.appendChild(badge);
}

function formatPosition(pos) {
  const suffixes = ["st", "nd", "rd", "th"];
  return pos + (suffixes[pos - 1] || "th") + " Place";
}

function formatCupResult(res) {
  if (res === "W") return "Winner 🏆";
  if (res === "RU") return "Runner-up 🥈";
  if (res === "SF") return "Semi-Finals";
  if (res === "QF") return "Quarter-Finals";
  return res;
}

// Manager profile photos database (Wikimedia Commons thumbnails)
const managerImages = {
  "W. E. Barclay / John McKenna": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/John_McKenna.jpg/120px-John_McKenna.jpg",
  "Tom Watson": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Tom_Watson_footballer.JPG/120px-Tom_Watson_footballer.JPG",
  "David Ashworth": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/David_Ashworth.jpg/120px-David_Ashworth.jpg",
  "Matt McQueen": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Matt_McQueen.jpg/120px-Matt_McQueen.jpg",
  "George Patterson": "",
  "George Kay": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/George_Kay_footballer.jpg/120px-George_Kay_footballer.jpg",
  "Don Welsh": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Don_Welsh.jpg/120px-Don_Welsh.jpg",
  "Phil Taylor": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Phil_Taylor_footballer.JPG/120px-Phil_Taylor_footballer.JPG",
  "Bill Shankly": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bill_Shankly.jpg/120px-Bill_Shankly.jpg",
  "Bob Paisley": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bob_Paisley.jpg/120px-Bob_Paisley.jpg",
  "Joe Fagan": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Joe_Fagan.jpg/120px-Joe_Fagan.jpg",
  "Kenny Dalglish": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kenny_Dalglish_1985.jpg/120px-Kenny_Dalglish_1985.jpg",
  "Graeme Souness": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Graeme_Souness_2015.jpg/120px-Graeme_Souness_2015.jpg",
  "Roy Evans": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Roy_Evans_2016.jpg/120px-Roy_Evans_2016.jpg",
  "Gérard Houllier": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/G%C3%A9rard_Houllier.jpg/120px-G%C3%A9rard_Houllier.jpg",
  "Rafael Benítez": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Rafael_Ben%C3%ADtez_2016.jpg/120px-Rafael_Ben%C3%ADtez_2016.jpg",
  "Roy Hodgson": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Roy_Hodgson_2020.jpg/120px-Roy_Hodgson_2020.jpg",
  "Kenny Dalglish (2nd)": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Kenny_Dalglish_2013.jpg/120px-Kenny_Dalglish_2013.jpg",
  "Brendan Rodgers": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Brendan_Rodgers_2015.jpg/120px-Brendan_Rodgers_2015.jpg",
  "Jürgen Klopp": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/J%C3%BCrgen_Klopp%2C_Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_05.jpg/120px-J%C3%BCrgen_Klopp%2C_Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_05.jpg",
  "Arne Slot": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Arne_Slot_2024.jpg/120px-Arne_Slot_2024.jpg",
  "Andoni Iraola": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Andoni_Iraola_2012.jpg/120px-Andoni_Iraola_2012.jpg"
};

// Extract manager initials for fallback avatars
function getInitials(name) {
  const parts = name.split(" / ");
  const mainName = parts[0];
  const words = mainName.split(" ");
  if (words.length >= 2) {
    let first = words[0].replace(".", "").trim();
    if (first.length === 1 && words.length >= 3) {
      return (first + words[2][0]).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return mainName.substring(0, 2).toUpperCase();
}

// Generate avatar HTML with image or gradient initial fallback
function createAvatarHTML(name, sizeClass) {
  const imageUrl = managerImages[name] || "";
  const initials = getInitials(name);
  
  // Consistent color selection based on name hash code
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    ["#e31b23", "#800f13"], // Velvet Crimson
    ["#c8a152", "#634f24"], // LFC Gold
    ["#1e3a8a", "#0f1d45"], // Historic Blue
    ["#10b981", "#055e3e"], // Emerald Green
    ["#6366f1", "#2e3170"], // Indigo
    ["#a855f7", "#52228c"], // Purple
    ["#ec4899", "#851c51"]  // Pink
  ];
  const colorIndex = Math.abs(hash) % colors.length;
  const gradient = `linear-gradient(135deg, ${colors[colorIndex][0]} 0%, ${colors[colorIndex][1]} 100%)`;

  if (imageUrl) {
    return `
      <div class="manager-avatar ${sizeClass}">
        <img src="${imageUrl}" alt="${name}" class="avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="avatar-fallback" style="background: ${gradient};">${initials}</div>
      </div>
    `;
  } else {
    return `
      <div class="manager-avatar ${sizeClass}">
        <div class="avatar-fallback" style="display: flex; background: ${gradient};">${initials}</div>
      </div>
    `;
  }
}

// 5. MANAGER ERAS SELECTOR
function initManagerEras() {
  const selectorList = document.getElementById("managers-selector-list");
  
  managersData.forEach((manager, index) => {
    const btn = document.createElement("button");
    btn.className = "manager-tab-btn";
    if (index === 19) btn.classList.add("active"); // Klopp active by default
    
    btn.innerHTML = `
      <div class="manager-btn-content">
        ${createAvatarHTML(manager.name, "mini")}
        <span>${manager.name}</span>
      </div>
      <span class="m-arrow">&rarr;</span>
    `;
    
    btn.addEventListener("click", () => {
      document.querySelectorAll(".manager-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showManagerProfile(manager);
    });

    selectorList.appendChild(btn);
  });

  // Load defaults (Klopp is at index 19)
  showManagerProfile(managersData[19]);
}

function showManagerProfile(manager) {
  document.getElementById("manager-profile-name").innerText = manager.name;
  document.getElementById("manager-profile-years").innerText = manager.years;
  document.getElementById("manager-profile-trophies-count").innerText = manager.trophies;
  document.getElementById("manager-profile-bio").innerText = manager.description;
  document.getElementById("manager-profile-seasons").innerText = manager.seasons;
  document.getElementById("manager-profile-winrate").innerText = manager.winRate;
  
  // Injected large avatar next to name
  const avatarContainer = document.getElementById("manager-profile-avatar-container");
  if (avatarContainer) {
    avatarContainer.innerHTML = createAvatarHTML(manager.name, "large");
  }
  
  // Calculate average position manually if not an integer
  document.getElementById("manager-profile-avgpos").innerText = manager.avgPosition;

  const trophiesList = document.getElementById("manager-profile-trophies-list");
  trophiesList.innerHTML = "";

  if (manager.trophiesList.length > 0) {
    manager.trophiesList.forEach(t => {
      const li = document.createElement("li");
      li.innerText = t;
      trophiesList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.style.background = "transparent";
    li.style.color = "var(--text-muted)";
    li.innerText = "No major trophies won during this era.";
    // remove default crown/trophy emoji list styles
    li.style.display = "block";
    li.style.padding = "0";
    trophiesList.appendChild(li);
  }
}

// 6. BEST XI BUILDER
let squadSelection = {
  GK: null,
  LB: null,
  LCB: null,
  RCB: null,
  RB: null,
  LCM: null,
  CM: null,
  RCM: null,
  LW: null,
  ST: null,
  RW: null
};

let activeSlotElement = null;

function initSquadBuilder() {
  const slots = document.querySelectorAll(".pitch-player-slot");
  const modal = document.getElementById("player-pool-modal");
  const closeModalBtn = document.getElementById("close-selector-btn");
  const resetBtn = document.getElementById("reset-squad-btn");
  const shareBtn = document.getElementById("share-squad-btn");

  slots.forEach(slot => {
    slot.addEventListener("click", () => {
      activeSlotElement = slot;
      const pos = slot.getAttribute("data-pos");
      const role = slot.getAttribute("data-role") || pos;
      
      openPlayerSelector(pos, role);
    });
  });

  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  resetBtn.addEventListener("click", resetSquad);
  shareBtn.addEventListener("click", generateSquadCard);
}

function openPlayerSelector(pos, role) {
  const modal = document.getElementById("player-pool-modal");
  const container = document.getElementById("selector-players-container");
  const titleLabel = document.getElementById("selecting-position-label");

  titleLabel.innerText = role;

  // Filter players based on position
  const candidates = legendaryPlayers.filter(player => player.position === pos);
  
  // Clear modal pool
  container.innerHTML = "";

  candidates.forEach(player => {
    const item = document.createElement("div");
    item.className = "selector-item";
    
    // Check if player is already selected in another slot
    const isAlreadySelected = Object.values(squadSelection).some(p => p && p.id === player.id);
    if (isAlreadySelected) {
      item.classList.add("selected");
    }

    item.innerHTML = `
      <div>
        <div class="sel-player-name">${player.name}</div>
        <div class="sel-player-years">${player.years}</div>
      </div>
      <span class="sel-player-rating">${player.rating}</span>
    `;

    if (!isAlreadySelected) {
      item.addEventListener("click", () => {
        selectPlayerForSlot(player);
        modal.classList.add("hidden");
      });
    }

    container.appendChild(item);
  });

  // Show Modal Panel
  modal.classList.remove("hidden");
}

function selectPlayerForSlot(player) {
  if (!activeSlotElement) return;

  const slotKey = activeSlotElement.getAttribute("data-role") || activeSlotElement.getAttribute("data-pos");
  
  // Set in state
  squadSelection[slotKey] = player;

  // Update slot UI
  activeSlotElement.classList.add("filled");
  
  // Abbreviate name
  const nameParts = player.name.split(" ");
  const shortName = nameParts.length > 1 ? `${nameParts[0][0]}. ${nameParts.slice(1).join(" ")}` : player.name;

  activeSlotElement.querySelector(".player-bubble").innerText = shortName;
  activeSlotElement.querySelector(".player-bubble").style.fontSize = "10px";

  // Re-calculate ratings and validations
  updateSquadStats();
}

function resetSquad() {
  squadSelection = {
    GK: null,
    LB: null, LCB: null, RCB: null, RB: null,
    LCM: null, CM: null, RCM: null,
    LW: null, ST: null, RW: null
  };

  const slots = document.querySelectorAll(".pitch-player-slot");
  slots.forEach(slot => {
    slot.classList.remove("filled");
    slot.querySelector(".player-bubble").innerText = "+";
    slot.querySelector(".player-bubble").style.fontSize = "20px";
  });

  document.getElementById("player-pool-modal").classList.add("hidden");
  document.getElementById("squad-share-box").classList.add("hidden");
  
  updateSquadStats();
}

function updateSquadStats() {
  const selectedPlayers = Object.values(squadSelection).filter(p => p !== null);
  const totalCount = selectedPlayers.length;

  // Calculate chemistry rating (average rating of players selected)
  let avgRating = 0;
  if (totalCount > 0) {
    const sum = selectedPlayers.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = Math.round(sum / totalCount);
  }

  // Update Chemistry rating DOM
  document.getElementById("team-rating-progress").style.width = `${avgRating}%`;
  document.getElementById("team-rating-value").innerText = `${avgRating} / 100`;

  // Update Checklist
  const gkValid = squadSelection.GK !== null;
  const dfCount = [squadSelection.LB, squadSelection.LCB, squadSelection.RCB, squadSelection.RB].filter(p => p !== null).length;
  const mfCount = [squadSelection.LCM, squadSelection.CM, squadSelection.RCM].filter(p => p !== null).length;
  const fwCount = [squadSelection.LW, squadSelection.ST, squadSelection.RW].filter(p => p !== null).length;

  updateCheckItem("GK", gkValid ? `✅ Goalkeeper` : `❌ Goalkeeper`, gkValid);
  updateCheckItem("DF", dfCount === 4 ? `✅ Defenders (4 / 4)` : `❌ Defenders (${dfCount} / 4)`, dfCount === 4);
  updateCheckItem("MF", mfCount === 3 ? `✅ Midfielders (3 / 3)` : `❌ Midfielders (${mfCount} / 3)`, mfCount === 3);
  updateCheckItem("FW", fwCount === 3 ? `✅ Forwards (3 / 3)` : `❌ Forwards (${fwCount} / 3)`, fwCount === 3);
}

function updateCheckItem(type, text, isValid) {
  const li = document.querySelector(`#lineup-checklist li[data-check="${type}"]`);
  if (li) {
    li.innerText = text;
    if (isValid) {
      li.classList.add("valid");
    } else {
      li.classList.remove("valid");
    }
  }
}

function generateSquadCard() {
  const selectedPlayers = Object.values(squadSelection).filter(p => p !== null);
  
  if (selectedPlayers.length < 11) {
    alert("Please select all 11 player slots on the pitch to generate your Dream XI team card!");
    return;
  }

  const sum = selectedPlayers.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = Math.round(sum / 11);

  const playersListText = [
    `GK: ${squadSelection.GK.name}`,
    `Defense: ${squadSelection.LB.name}, ${squadSelection.LCB.name}, ${squadSelection.RCB.name}, ${squadSelection.RB.name}`,
    `Midfield: ${squadSelection.LCM.name}, ${squadSelection.CM.name}, ${squadSelection.RCM.name}`,
    `Attack: ${squadSelection.LW.name}, ${squadSelection.ST.name}, ${squadSelection.RW.name}`
  ].join(" | ");

  document.getElementById("gen-squad-names").innerText = playersListText;
  document.getElementById("gen-squad-ovr").innerText = avgRating;
  
  // Show output card
  document.getElementById("squad-share-box").classList.remove("hidden");
}

// 7. INTERACTIVE FAN POLL
function initFanPoll() {
  const pollVotedKey = "lfc_fan_poll_voted";
  const pollOptionKey = "lfc_fan_poll_option";

  // Pre-seed votes data
  let pollVotes = [
    542, // Option 0: PL / Quadruple Challenge
    384, // Option 1: Top 4 & Cup
    102, // Option 2: Top 4 Only
    36   // Option 3: Outside Top 4
  ];

  const votingState = document.getElementById("poll-voting-state");
  const resultsState = document.getElementById("poll-results-state");
  const optButtons = document.querySelectorAll(".poll-opt-btn");
  const resetBtn = document.getElementById("reset-vote-btn");

  const updateResultsUI = (userSelection) => {
    // If user selection is provided, increment it locally
    const currentVotes = [...pollVotes];
    if (userSelection !== null && userSelection !== undefined) {
      currentVotes[userSelection] += 1;
    }

    const total = currentVotes.reduce((acc, v) => acc + v, 0);
    document.getElementById("poll-total-votes").innerText = `Total Votes: ${total.toLocaleString()}`;

    currentVotes.forEach((votesCount, idx) => {
      const percentage = total > 0 ? Math.round((votesCount / total) * 100) : 0;
      
      // Update percentage text
      document.getElementById(`pct-${idx}`).innerText = `${percentage}%`;
      // Update count text
      document.getElementById(`count-${idx}`).innerText = `${votesCount.toLocaleString()} votes`;
      // Update bar width
      setTimeout(() => {
        document.getElementById(`bar-${idx}`).style.width = `${percentage}%`;
      }, 50 * idx); // stagger animation slightly
    });
  };

  const handleVote = (optionIndex) => {
    localStorage.setItem(pollVotedKey, "true");
    localStorage.setItem(pollOptionKey, optionIndex.toString());

    // Switch UI state with smooth fade
    votingState.classList.add("hidden");
    resultsState.classList.remove("hidden");

    updateResultsUI(optionIndex);
  };

  // Attach button click listeners
  optButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const optionIndex = parseInt(btn.getAttribute("data-option"));
      handleVote(optionIndex);
    });
  });

  // Attach reset button listener
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(pollVotedKey);
      localStorage.removeItem(pollOptionKey);

      // Switch back to voting state
      resultsState.classList.add("hidden");
      votingState.classList.remove("hidden");

      // Reset bar widths to 0 first
      for (let i = 0; i < 4; i++) {
        document.getElementById(`bar-${i}`).style.width = "0%";
      }
    });
  }

  // Initialize display state based on localStorage
  const hasVoted = localStorage.getItem(pollVotedKey) === "true";
  if (hasVoted) {
    votingState.classList.add("hidden");
    resultsState.classList.remove("hidden");
    const optionIndex = parseInt(localStorage.getItem(pollOptionKey) || "0");
    updateResultsUI(optionIndex);
  } else {
    resultsState.classList.add("hidden");
    votingState.classList.remove("hidden");
  }
}

// 8. TWITTER FEED SKELETON LOADER & SOURCE SWITCHER
function initTwitterFeed() {
  const skeleton = document.getElementById("x-feed-skeleton");
  const container = document.querySelector(".x-feed-container");
  if (!skeleton || !container) return;

  const mockFeeds = {
    "LFC": [
      {
        displayName: "Liverpool FC",
        handle: "LFC",
        verified: true,
        avatar: "🔴",
        time: "2h",
        text: "Pre-season training commences next week at the AXA Training Centre! 🔴 The lads are ready to gear up for the 2026/27 campaign. #LFC",
        replies: "124",
        retweets: "482",
        likes: "5.2K"
      },
      {
        displayName: "Liverpool FC",
        handle: "LFC",
        verified: true,
        avatar: "🔴",
        time: "5h",
        text: "Mo Salah on the upcoming season: 'We have new energy, new ideas, and we want to fight for all trophies. The fans deserve our absolute best.' 🇪🇬👑",
        replies: "340",
        retweets: "1.2K",
        likes: "18.4K"
      },
      {
        displayName: "Liverpool FC",
        handle: "LFC",
        verified: true,
        avatar: "🔴",
        time: "1d",
        text: "Tickets for our pre-season friendly matches are now on general sale. Secure your seat to see Andoni Iraola's side in action! 🎟️🔴",
        replies: "89",
        retweets: "156",
        likes: "2.1K"
      }
    ],
    "AnfieldWatch": [
      {
        displayName: "Anfield Watch",
        handle: "AnfieldWatch",
        verified: true,
        avatar: "👀",
        time: "45m",
        text: "Liverpool are reportedly monitoring the situation of several key targets as Iraola looks to bolster his midfield ahead of the new season. Thoughts, Reds? 🔴✍️",
        replies: "56",
        retweets: "72",
        likes: "945"
      },
      {
        displayName: "Anfield Watch",
        handle: "AnfieldWatch",
        verified: true,
        avatar: "👀",
        time: "3h",
        text: "Virgil van Dijk has reiterated his commitment to the club, stating he is 'extremely excited' to work under the new manager. Captain. 🫡🔴",
        replies: "18",
        retweets: "45",
        likes: "1.8K"
      },
      {
        displayName: "Anfield Watch",
        handle: "AnfieldWatch",
        verified: true,
        avatar: "👀",
        time: "6h",
        text: "LFC's opening fixtures of the 2026/27 season look challenging. Here is the full rundown of our first 5 games... Full schedule details coming soon. 👇",
        replies: "89",
        retweets: "102",
        likes: "1.2K"
      }
    ],
    "thisisanfield": [
      {
        displayName: "This Is Anfield",
        handle: "thisisanfield",
        verified: true,
        avatar: "🔴",
        time: "1h",
        text: "Tactical Analysis: How Andoni Iraola's high-pressing style will fit the current Liverpool squad. Can he replicate his Bournemouth success? 🧠⚽",
        replies: "12",
        retweets: "34",
        likes: "420"
      },
      {
        displayName: "This Is Anfield",
        handle: "thisisanfield",
        verified: true,
        avatar: "🔴",
        time: "4h",
        text: "Pre-season schedule in full: Dates, venues, and where to watch the Reds' preparation matches. 📺🔴",
        replies: "8",
        retweets: "19",
        likes: "310"
      },
      {
        displayName: "This Is Anfield",
        handle: "thisisanfield",
        verified: true,
        avatar: "🔴",
        time: "8h",
        text: "Five Academy stars who could break into the first team under the new coaching staff this summer. 💫",
        replies: "24",
        retweets: "55",
        likes: "890"
      }
    ],
    "JamesPearceLFC": [
      {
        displayName: "James Pearce",
        handle: "JamesPearceLFC",
        verified: true,
        avatar: "📝",
        time: "2h",
        text: "Liverpool pre-season starts on July 6th. Expected to see a few new faces by then. The club is actively working on two key defensive signings. 🔴 #LFC",
        replies: "145",
        retweets: "210",
        likes: "3.4K"
      },
      {
        displayName: "James Pearce",
        handle: "JamesPearceLFC",
        verified: true,
        avatar: "📝",
        time: "5h",
        text: "Understand Andoni Iraola has already held individual calls with senior players. Initial feedback has been incredibly positive. Exciting times ahead.",
        replies: "78",
        retweets: "120",
        likes: "2.8K"
      },
      {
        displayName: "James Pearce",
        handle: "JamesPearceLFC",
        verified: true,
        avatar: "📝",
        time: "1d",
        text: "No truth in rumors linking Luis Diaz with a move away this summer. He is fully in Iraola's plans for the upcoming campaign. 🇨🇴🔴",
        replies: "92",
        retweets: "140",
        likes: "3.1K"
      }
    ]
  };

  let fallbackTimeout;
  let hasRendered = false;

  const renderMockTweets = (username) => {
    const tweets = mockFeeds[username] || mockFeeds["LFC"];
    const html = `
      <div class="mock-tweets-list">
        ${tweets.map(t => `
          <div class="mock-tweet">
            <div class="tweet-header">
              <div class="tweet-avatar">${t.avatar}</div>
              <div class="tweet-user-info">
                <div class="tweet-user-row-top">
                  <span class="tweet-display-name">${t.displayName}</span>
                  ${t.verified ? '<span class="tweet-verified-badge" style="color: #1d9bf0;">✔</span>' : ''}
                  <span class="tweet-handle">@${t.handle}</span>
                  <span class="tweet-time">· ${t.time}</span>
                </div>
              </div>
              <span class="tweet-x-logo">𝕏</span>
            </div>
            <div class="tweet-text">${t.text}</div>
            <div class="tweet-actions">
              <span class="tweet-action">💬 ${t.replies}</span>
              <span class="tweet-action">🔁 ${t.retweets}</span>
              <span class="tweet-action">❤️ ${t.likes}</span>
            </div>
          </div>
        `).join('')}
        <div style="text-align: center; padding: 12px; font-size: 11px;">
          <a href="https://twitter.com/${username}" target="_blank" style="color: var(--gold-text); text-decoration: underline; font-weight: 700;">
            View Live @${username} on X.com
          </a>
        </div>
      </div>
    `;
    container.innerHTML = html;
  };

  const loadFeed = (username) => {
    hasRendered = false;
    skeleton.classList.remove("hidden");
    container.innerHTML = `
      <a class="twitter-timeline" 
         data-theme="dark" 
         data-height="650" 
         data-chrome="noheader nofooter noborders transparent"
         data-link-color="#e2c07d"
         href="https://twitter.com/${username}?ref_src=twsrc%5Etfw">
        Loading Tweets by @${username}...
      </a>
    `;

    clearTimeout(fallbackTimeout);

    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }

    // Set fallback timeout to render mock tweets if official widget takes too long (1.5s)
    fallbackTimeout = setTimeout(() => {
      if (!hasRendered) {
        skeleton.classList.add("hidden");
        renderMockTweets(username);
      }
    }, 1500);
  };

  // Listen to Twitter's widgets rendered event
  if (window.twttr) {
    twttr.ready(function (t) {
      t.events.bind("rendered", function (event) {
        hasRendered = true;
        skeleton.classList.add("hidden");
      });
    });
  }

  // Setup tab switcher buttons
  const tabButtons = document.querySelectorAll(".feed-tab-btn");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;

      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const username = btn.getAttribute("data-username");
      loadFeed(username);
    });
  });

  // Start initial feed loading
  loadFeed("LFC");
}

// 9. KOP PREDICTOR & LOYALTY SYSTEM
function initPredictorSystem() {
  const localStorageKeys = {
    username: "lfc_loyalty_username",
    walletBalance: "lfc_loyalty_balance",
    lifetimePoints: "lfc_loyalty_lifetime",
    lastCheckin: "lfc_loyalty_checkin",
    predictionSubmitted: "lfc_loyalty_pred_sub",
    predictionLfcScore: "lfc_loyalty_pred_lfc",
    predictionOppScore: "lfc_loyalty_pred_opp",
    predictionGoalscorer: "lfc_loyalty_pred_scorer",
    predictionCleanSheet: "lfc_loyalty_pred_clean",
    redeemedWallpapers: "lfc_loyalty_redeemed_wallpapers",
    redeemedFrames: "lfc_loyalty_redeemed_frames",
    redeemedBallots: "lfc_loyalty_redeemed_ballots"
  };

  // DOM Elements
  const displayNameInput = document.getElementById("user-display-name");
  const saveUsernameBtn = document.getElementById("save-username-btn");
  const walletPointsEl = document.getElementById("user-wallet-points");
  const lifetimePointsEl = document.getElementById("user-lifetime-points");
  const avatarCircleEl = document.getElementById("user-profile-avatar");
  const tierBadgeEl = document.getElementById("user-tier-badge");
  const currentTierNameEl = document.getElementById("current-tier-name");
  const pointsToNextTierEl = document.getElementById("points-to-next-tier");
  const tierProgressBarEl = document.getElementById("tier-progress-bar");
  const dailyCheckinBtn = document.getElementById("daily-checkin-btn");

  const submitPredBtn = document.getElementById("submit-prediction-btn");
  const predLfcScoreInput = document.getElementById("pred-lfc-score");
  const predOppScoreInput = document.getElementById("pred-opp-score");
  const predGoalscorerSelect = document.getElementById("pred-goalscorer");
  const predCleanSheetCheck = document.getElementById("pred-clean-sheet");

  const predictionFormContainer = document.getElementById("prediction-form-container");
  const simulatorConsoleContainer = document.getElementById("simulator-console-container");
  const lockedPredSummaryEl = document.getElementById("locked-prediction-summary");
  const simulateMatchBtn = document.getElementById("simulate-match-btn");

  const simulationResultPanel = document.getElementById("simulation-result-panel");
  const simFinalScoreEl = document.getElementById("sim-final-score");
  const simGoalscorerEl = document.getElementById("sim-goalscorer");
  const simCleanSheetEl = document.getElementById("sim-cleansheet");
  const simPtsTotalEl = document.getElementById("sim-pts-total");
  const ptsOutcomeEl = document.getElementById("pts-outcome");
  const ptsScoreEl = document.getElementById("pts-score");
  const ptsScorerEl = document.getElementById("pts-scorer");
  const ptsCleanSheetEl = document.getElementById("pts-cleansheet");
  const resetSimulatorBtn = document.getElementById("reset-simulator-btn");

  const redeemButtons = document.querySelectorAll(".redeem-btn");
  const successBox = document.getElementById("redemption-success-box");
  const successMessage = document.getElementById("redemption-success-message");
  const codeContainer = document.getElementById("redeemed-code-container");

  const userLeaderboardRankEl = document.getElementById("user-leaderboard-rank");
  const userLeaderboardNameEl = document.getElementById("user-leaderboard-name");
  const userLeaderboardTierEl = document.getElementById("user-leaderboard-tier");
  const userLeaderboardPointsEl = document.getElementById("user-leaderboard-points");

  // Load state or set defaults
  let username = localStorage.getItem(localStorageKeys.username) || "KopiteFan";
  let balance = parseInt(localStorage.getItem(localStorageKeys.walletBalance)) || 0;
  let lifetime = parseInt(localStorage.getItem(localStorageKeys.lifetimePoints)) || 0;
  let lastCheckin = parseInt(localStorage.getItem(localStorageKeys.lastCheckin)) || 0;

  // Initialize UI Values
  const updateUI = () => {
    // 1. Profile Name
    if (displayNameInput) displayNameInput.value = username;
    if (userLeaderboardNameEl) userLeaderboardNameEl.innerText = `${username} (You)`;
    
    // Avatar initials
    if (avatarCircleEl) {
      avatarCircleEl.innerText = username.substring(0, 2).toUpperCase();
    }

    // 2. Wallets
    if (walletPointsEl) walletPointsEl.innerText = `${balance.toLocaleString()} pts`;
    if (lifetimePointsEl) lifetimePointsEl.innerText = `${lifetime.toLocaleString()} pts`;
    if (userLeaderboardPointsEl) userLeaderboardPointsEl.innerText = `${lifetime.toLocaleString()} pts`;

    // 3. Tier calculation
    let tier = "Kopite";
    let nextTier = "Red";
    let nextPoints = 1000;
    let prevPoints = 0;

    if (lifetime >= 50000) {
      tier = "Centenary";
      nextTier = "Max Tier";
      nextPoints = 50000;
      prevPoints = 50000;
    } else if (lifetime >= 15000) {
      tier = "Gold";
      nextTier = "Centenary";
      nextPoints = 50000;
      prevPoints = 15000;
    } else if (lifetime >= 5000) {
      tier = "Silver";
      nextTier = "Gold";
      nextPoints = 15000;
      prevPoints = 5000;
    } else if (lifetime >= 1000) {
      tier = "Red";
      nextTier = "Silver";
      nextPoints = 5000;
      prevPoints = 1000;
    }

    // Badge CSS update
    if (tierBadgeEl) {
      tierBadgeEl.innerText = tier;
      tierBadgeEl.className = "avatar-badge"; // reset classes
      
      // Update badge style mapping
      if (tier === "Kopite") tierBadgeEl.style.background = "rgba(113, 113, 122, 0.15)";
      if (tier === "Red") tierBadgeEl.style.background = "var(--crimson-primary)";
      if (tier === "Silver") tierBadgeEl.style.background = "rgba(255, 255, 255, 0.08)";
      if (tier === "Gold") tierBadgeEl.style.background = "var(--gold-primary)";
      if (tier === "Centenary") tierBadgeEl.style.background = "linear-gradient(135deg, var(--crimson-primary) 0%, var(--gold-primary) 100%)";
      if (tier === "Kopite" || tier === "Silver") {
        tierBadgeEl.style.color = "var(--text-primary)";
      } else {
        tierBadgeEl.style.color = "var(--bg-primary)";
      }
    }

    if (userLeaderboardTierEl) {
      userLeaderboardTierEl.innerText = tier;
      userLeaderboardTierEl.className = `badge tier-${tier.toLowerCase()}`;
    }

    if (currentTierNameEl) currentTierNameEl.innerText = tier;
    
    if (nextTier === "Max Tier") {
      if (pointsToNextTierEl) pointsToNextTierEl.innerText = "Centenary (Ultimate Tier)";
      if (tierProgressBarEl) tierProgressBarEl.style.width = "100%";
    } else {
      const needed = nextPoints - lifetime;
      if (pointsToNextTierEl) pointsToNextTierEl.innerText = `${needed.toLocaleString()} pts to ${nextTier}`;
      const progress = ((lifetime - prevPoints) / (nextPoints - prevPoints)) * 100;
      if (tierProgressBarEl) tierProgressBarEl.style.width = `${progress}%`;
    }

    // Update leaderboard rank dynamically (simplified sorting for mockup)
    if (userLeaderboardRankEl) {
      if (lifetime >= 42500) userLeaderboardRankEl.innerText = "1";
      else if (lifetime >= 16800) userLeaderboardRankEl.innerText = "2";
      else if (lifetime >= 15200) userLeaderboardRankEl.innerText = "3";
      else if (lifetime >= 8450) userLeaderboardRankEl.innerText = "4";
      else if (lifetime >= 350) userLeaderboardRankEl.innerText = "5";
      else userLeaderboardRankEl.innerText = "6";
    }

    // Sort leaderboard row visually inside DOM
    const leaderboardBody = document.getElementById("leaderboard-body");
    const userRow = document.getElementById("leaderboard-user-row");
    if (leaderboardBody && userRow) {
      const rows = Array.from(leaderboardBody.querySelectorAll("tr"));
      // remove user row from rows array temporarily
      const otherRows = rows.filter(r => r !== userRow);
      
      // score map including current mock values
      const scores = {
        "KopKing99": 42500,
        "ScousePride": 16800,
        "AnfieldHustler": 15200,
        "SalahMagic": 8450,
        "MacAllisterClass": 350
      };
      
      // Sort other rows based on score
      otherRows.sort((a, b) => {
        const nameA = a.cells[1].innerText;
        const nameB = b.cells[1].innerText;
        return (scores[nameB] || 0) - (scores[nameA] || 0);
      });

      // Find where to insert user row
      let inserted = false;
      leaderboardBody.innerHTML = "";
      
      let rank = 1;
      otherRows.forEach(row => {
        const name = row.cells[1].innerText;
        const score = scores[name] || 0;
        
        if (lifetime >= score && !inserted) {
          userRow.cells[0].innerText = rank;
          leaderboardBody.appendChild(userRow);
          rank++;
          inserted = true;
        }
        
        row.cells[0].innerText = rank;
        leaderboardBody.appendChild(row);
        rank++;
      });

      if (!inserted) {
        userRow.cells[0].innerText = rank;
        leaderboardBody.appendChild(userRow);
      }
    }

    // 4. Daily Check-in Lockouts
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - lastCheckin < oneDay) {
      if (dailyCheckinBtn) {
        dailyCheckinBtn.disabled = true;
        dailyCheckinBtn.querySelector("span").innerText = "🚶‍♂️ Claimed Daily Walk";
      }
    } else {
      if (dailyCheckinBtn) {
        dailyCheckinBtn.disabled = false;
        dailyCheckinBtn.querySelector("span").innerText = "🚶‍♂️ Claim Daily Anfield Walk";
      }
    }

    // 5. Reward Buttons State
    redeemButtons.forEach(btn => {
      const cost = parseInt(btn.getAttribute("data-cost"));
      const rewardItem = btn.closest(".reward-item");
      const rewardId = rewardItem.getAttribute("data-reward-id");
      const redeemed = localStorage.getItem(`lfc_redeemed_${rewardId}`) === "true";
      
      if (redeemed) {
        btn.disabled = true;
        btn.innerText = "Redeemed";
        btn.style.borderColor = "#10b981";
        btn.style.color = "#10b981";
      } else if (balance < cost) {
        btn.disabled = true;
        btn.innerText = "Locked";
      } else {
        btn.disabled = false;
        btn.innerText = "Redeem";
        btn.style.borderColor = "var(--gold-primary)";
        btn.style.color = "var(--gold-text)";
      }
    });
  };

  // Bind Username edits
  if (saveUsernameBtn && displayNameInput) {
    saveUsernameBtn.addEventListener("click", () => {
      const val = displayNameInput.value.trim();
      if (val.length > 0) {
        username = val;
        localStorage.setItem(localStorageKeys.username, username);
        
        // Show saved state
        saveUsernameBtn.innerText = "Saved!";
        setTimeout(() => {
          saveUsernameBtn.innerText = "Save";
        }, 1500);

        updateUI();
      }
    });
  }

  // Bind Daily checkin button click
  if (dailyCheckinBtn) {
    dailyCheckinBtn.addEventListener("click", () => {
      const now = Date.now();
      lastCheckin = now;
      localStorage.setItem(localStorageKeys.lastCheckin, now.toString());

      balance += 10;
      lifetime += 10;
      localStorage.setItem(localStorageKeys.walletBalance, balance.toString());
      localStorage.setItem(localStorageKeys.lifetimePoints, lifetime.toString());

      updateUI();
    });
  }

  // Manage Predictor submissions flow states
  const showPredictorState = () => {
    const isSubmitted = localStorage.getItem(localStorageKeys.predictionSubmitted) === "true";
    if (isSubmitted) {
      if (predictionFormContainer) predictionFormContainer.classList.add("hidden");
      if (simulatorConsoleContainer) simulatorConsoleContainer.classList.remove("hidden");
      if (simulationResultPanel) simulationResultPanel.classList.add("hidden");

      const predLfc = localStorage.getItem(localStorageKeys.predictionLfcScore) || "0";
      const predOpp = localStorage.getItem(localStorageKeys.predictionOppScore) || "0";
      const predScorer = localStorage.getItem(localStorageKeys.predictionGoalscorer) || "None";
      const predClean = localStorage.getItem(localStorageKeys.predictionCleanSheet) === "true" ? "Yes" : "No";

      if (lockedPredSummaryEl) {
        lockedPredSummaryEl.innerHTML = `
          <strong>Liverpool ${predLfc} - ${predOpp} Real Madrid</strong><br>
          <span style="font-size: 11px; color: var(--text-secondary);">
            First Scorer: ${predScorer} | Clean Sheet: ${predClean}
          </span>
        `;
      }
    } else {
      if (predictionFormContainer) predictionFormContainer.classList.remove("hidden");
      if (simulatorConsoleContainer) simulatorConsoleContainer.classList.add("hidden");
      if (simulationResultPanel) simulationResultPanel.classList.add("hidden");
    }
  };

  if (submitPredBtn) {
    submitPredBtn.addEventListener("click", () => {
      localStorage.setItem(localStorageKeys.predictionSubmitted, "true");
      localStorage.setItem(localStorageKeys.predictionLfcScore, predLfcScoreInput.value);
      localStorage.setItem(localStorageKeys.predictionOppScore, predOppScoreInput.value);
      localStorage.setItem(localStorageKeys.predictionGoalscorer, predGoalscorerSelect.value);
      localStorage.setItem(localStorageKeys.predictionCleanSheet, predCleanSheetCheck.checked.toString());

      showPredictorState();
    });
  }

  // Simulator Engine calculation
  if (simulateMatchBtn) {
    simulateMatchBtn.addEventListener("click", () => {
      // Mock random match conclusion score generator
      // LFC score is slightly biased to win
      const lfcScore = Math.floor(Math.random() * 4); // 0 to 3
      const oppScore = Math.floor(Math.random() * 3); // 0 to 2
      const isCleanSheet = lfcScore > 0 && oppScore === 0;

      // Select goalscorer if LFC scored
      const scorersPool = ["Mohamed Salah", "Cody Gakpo", "Luis Díaz", "Darwin Núñez", "Diogo Jota"];
      const actualScorer = lfcScore > 0 ? scorersPool[Math.floor(Math.random() * scorersPool.length)] : "None";

      // Load user prediction parameters
      const predLfc = parseInt(localStorage.getItem(localStorageKeys.predictionLfcScore)) || 0;
      const predOpp = parseInt(localStorage.getItem(localStorageKeys.predictionOppScore)) || 0;
      const predScorer = localStorage.getItem(localStorageKeys.predictionGoalscorer) || "none";
      const predClean = localStorage.getItem(localStorageKeys.predictionCleanSheet) === "true";

      // Calculate points breakdown
      let pointsOutcome = 0;
      let pointsScore = 0;
      let pointsScorer = 0;
      let pointsClean = 0;

      // Correct Outcome checks (Win / Draw / Loss)
      const predDiff = predLfc - predOpp;
      const actualDiff = lfcScore - oppScore;
      const isOutcomeCorrect = (predDiff > 0 && actualDiff > 0) || (predDiff === 0 && actualDiff === 0) || (predDiff < 0 && actualDiff < 0);
      if (isOutcomeCorrect) pointsOutcome = 20;

      // Exact score checks
      if (predLfc === lfcScore && predOpp === oppScore) pointsScore = 50;

      // First Goalscorer check
      if (predScorer === actualScorer && actualScorer !== "None") pointsScorer = 30;

      // Clean sheet check
      if (predClean === isCleanSheet) pointsClean = 15;

      const totalEarned = pointsOutcome + pointsScore + pointsScorer + pointsClean;

      // Grant points and balance wallets
      balance += totalEarned;
      lifetime += totalEarned;
      localStorage.setItem(localStorageKeys.walletBalance, balance.toString());
      localStorage.setItem(localStorageKeys.lifetimePoints, lifetime.toString());

      // Show Simulation concluding UI
      if (simulatorConsoleContainer) simulatorConsoleContainer.classList.add("hidden");
      if (simulationResultPanel) simulationResultPanel.classList.remove("hidden");

      if (simFinalScoreEl) simFinalScoreEl.innerText = `LFC ${lfcScore} - ${oppScore} RMA`;
      if (simGoalscorerEl) simGoalscorerEl.innerText = `First Scorer: ${actualScorer}`;
      if (simCleanSheetEl) simCleanSheetEl.innerText = `Clean Sheet: ${isCleanSheet ? "Yes" : "No"}`;

      if (simPtsTotalEl) simPtsTotalEl.innerText = `+${totalEarned} pts`;
      if (ptsOutcomeEl) ptsOutcomeEl.innerHTML = `Correct Outcome: <span>+${pointsOutcome} pts</span>`;
      if (ptsScoreEl) ptsScoreEl.innerHTML = `Exact Score: <span>+${pointsScore} pts</span>`;
      if (ptsScorerEl) ptsScorerEl.innerHTML = `First Scorer: <span>+${pointsScorer} pts</span>`;
      if (ptsCleanSheetEl) ptsCleanSheetEl.innerHTML = `Clean Sheet: <span>+${pointsClean} pts</span>`;

      updateUI();
    });
  }

  // Reset/Play next match button
  if (resetSimulatorBtn) {
    resetSimulatorBtn.addEventListener("click", () => {
      localStorage.removeItem(localStorageKeys.predictionSubmitted);
      localStorage.removeItem(localStorageKeys.predictionLfcScore);
      localStorage.removeItem(localStorageKeys.predictionOppScore);
      localStorage.removeItem(localStorageKeys.predictionGoalscorer);
      localStorage.removeItem(localStorageKeys.predictionCleanSheet);

      // Reset Form fields
      if (predLfcScoreInput) predLfcScoreInput.value = "0";
      if (predOppScoreInput) predOppScoreInput.value = "0";
      if (predGoalscorerSelect) predGoalscorerSelect.value = "none";
      if (predCleanSheetCheck) predCleanSheetCheck.checked = false;

      // Reset upcoming match randomly to make it look active
      const teamsList = ["CHELSEA", "MAN CITY", "AC MILAN", "ARSENAL", "MAN UNITED", "BARCELONA"];
      const randTeam = teamsList[Math.floor(Math.random() * teamsList.length)];
      const oppLabel = document.getElementById("opponent-name-label");
      if (oppLabel) oppLabel.innerText = randTeam;

      // Mock random kickoff timers
      const countdownTimer = document.getElementById("match-countdown-timer");
      if (countdownTimer) {
        const randDays = Math.floor(Math.random() * 5) + 1;
        const randHours = Math.floor(Math.random() * 24);
        countdownTimer.innerText = `Kickoff in ${randDays}d ${randHours}h 30m`;
      }

      showPredictorState();
    });
  }

  // Redeem buttons listener
  redeemButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cost = parseInt(btn.getAttribute("data-cost"));
      const rewardItem = btn.closest(".reward-item");
      const rewardId = rewardItem.getAttribute("data-reward-id");
      const rewardName = rewardItem.querySelector("h5").innerText;

      if (balance >= cost) {
        balance -= cost;
        localStorage.setItem(localStorageKeys.walletBalance, balance.toString());
        localStorage.setItem(`lfc_redeemed_${rewardId}`, "true");

        // Display success alert coupon code
        if (successBox && successMessage && codeContainer) {
          successMessage.innerText = `You have successfully unlocked "${rewardName}". Code is ready!`;
          
          // Generate mockup hash code
          const randHex = Math.random().toString(36).substr(2, 8).toUpperCase();
          codeContainer.innerText = `${randHex.substring(0, 4)}-${randHex.substring(4, 8)}`;
          
          successBox.classList.remove("hidden");
          
          // Smooth scroll to success box
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        updateUI();
      }
    });
  });

  // Initial runs
  showPredictorState();
  updateUI();
}

// 10. LIGHT/DARK THEME TOGGLE ENGINE
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    const currentTheme = isLight ? "light" : "dark";
    localStorage.setItem("lfc_dashboard_theme", currentTheme);
    updateChartsTheme(currentTheme);
  });

  // Apply chart styles for current theme on boot
  const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
  updateChartsTheme(currentTheme);
}

function updateChartsTheme(theme) {
  const isLight = theme === "light";
  const ticksColor = isLight ? "#495057" : "#cccccc";
  const gridColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.05)";
  const legendColor = isLight ? "#111111" : "#ffffff";
  const tooltipBg = isLight ? "#f8f9fa" : "#1c1c1c";
  const tooltipText = isLight ? "#111111" : "#ffffff";

  const charts = [positionsChartInst, pointsChartInst, goalsChartInst];
  charts.forEach(chart => {
    if (!chart) return;
    
    // Update Y scale ticks and grid
    if (chart.options.scales.y) {
      if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = ticksColor;
      if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
    }
    
    // Update X scale ticks and grid
    if (chart.options.scales.x) {
      if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = ticksColor;
      if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = gridColor;
    }

    // Update legend labels color
    if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
      chart.options.plugins.legend.labels.color = legendColor;
    }

    // Update tooltip colors
    if (chart.options.plugins.tooltip) {
      chart.options.plugins.tooltip.backgroundColor = tooltipBg;
      chart.options.plugins.tooltip.titleColor = isLight ? "#C8102E" : "#E3D4AD";
      chart.options.plugins.tooltip.bodyColor = tooltipText;
      chart.options.plugins.tooltip.borderColor = isLight ? "rgba(200, 16, 46, 0.2)" : "rgba(227, 27, 35, 0.3)";
    }

    chart.update();
  });

  // Dynamically update wallpaper thumbnails to match the new theme
  if (typeof renderWallpaperThumbnails === "function") {
    setTimeout(renderWallpaperThumbnails, 200);
  }
}

// 11. NEWSLETTER SUBSCRIBE & FEEDBACK SUGGESTIONS FORM
function initNewsletterSubscribe() {
  const emailInput = document.getElementById("newsletter-email");
  const feedbackInput = document.getElementById("feedback-features");
  const submitBtn = document.getElementById("subscribe-submit-btn");
  const formContainer = document.getElementById("newsletter-form-container");
  const successState = document.getElementById("newsletter-success-state");
  const savedEmailLbl = document.getElementById("saved-email-lbl");
  const savedFeedbackLbl = document.getElementById("saved-feedback-lbl");
  const resetBtn = document.getElementById("reset-newsletter-btn");

  if (!submitBtn || !emailInput || !formContainer || !successState) return;

  // --- PRODUCTION OUTBOUND SERVICES CONFIGURATION ---
  // 1. Web3Forms: Sends suggestions and email info to admin at noppadol@neogens.co
  const WEB3FORMS_ACCESS_KEY = "1143c093-6170-477e-a936-808e00939171";

  // 2. EmailJS: Sends auto-response directly to the user (e.g. gmail/smtp)
  // Register a free account at https://www.emailjs.com/ to get your credentials.
  // In your EmailJS dashboard:
  // - Create an Email Service (e.g., Service ID: "service_lfc_tracker")
  // - Create an Email Template (e.g., Template ID: "template_lfc_autoresponse")
  // - Set the dynamic parameters inside the template template: 
  //   {{user_email}} (for To Email), {{feedback_text}}, {{timestamp}}
  // - Find your Public Key under Account > API Keys
  const EMAILJS_SERVICE_ID = "service_h1pu116"; // Replace with your Service ID
  const EMAILJS_TEMPLATE_ID = "template_ih5521c"; // Replace with your Template ID
  const EMAILJS_PUBLIC_KEY = "aCKSHdQwOTZesYRSv"; // Replace with your Public Key

  const newsletterKey = "lfc_newsletter_email";
  const feedbackKey = "lfc_newsletter_feedback";

  const showState = () => {
    const savedEmail = localStorage.getItem(newsletterKey);
    if (savedEmail) {
      formContainer.classList.add("hidden");
      successState.classList.remove("hidden");
      if (savedEmailLbl) savedEmailLbl.innerText = `Email: ${savedEmail}`;
      
      const savedFeedback = localStorage.getItem(feedbackKey) || "None";
      if (savedFeedbackLbl) {
        savedFeedbackLbl.innerText = savedFeedback !== "None" ? `Suggestion: "${savedFeedback}"` : "No suggestions submitted.";
      }
    } else {
      formContainer.classList.remove("hidden");
      successState.classList.add("hidden");
    }
  };

  submitBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const feedback = feedbackInput.value.trim();

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    localStorage.setItem(newsletterKey, email);
    const feedbackText = feedback.length > 0 ? feedback : "No suggestions provided. Subscribed for news updates.";
    if (feedback.length > 0) {
      localStorage.setItem(feedbackKey, feedback);
    } else {
      localStorage.removeItem(feedbackKey);
    }

    const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }) + " (ICT)";

    // A. Outbound API Submit Dispatch Alert (Web3Forms to send suggestions to Admin)
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `[LFC Tracker Feedback] Suggestions from ${email}`,
        from_name: "LFC Dashboard User",
        email: email,
        message: `Dear Administrator,\n\nWe have received a new feature suggestion/feedback submission on the Liverpool FC All-Time Success Dashboard.\n\nUser Email: ${email}\nTime: ${timestamp}\n\nFeedback / Suggestion:\n"${feedbackText}"\n\nThis is an automated notification.`
      })
    })
    .then(res => res.json())
    .then(data => console.log("Outbound Admin Alert (Web3Forms) Dispatched:", data))
    .catch(err => console.error("Outbound Admin Alert (Web3Forms) Error:", err));

    // B. Outbound Auto-Response Email to User (EmailJS REST API)
    if (
      EMAILJS_SERVICE_ID && EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
      EMAILJS_TEMPLATE_ID && EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID" &&
      EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY"
    ) {
      fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            user_email: email,
            to_email: email,
            email: email,
            feedback_text: feedbackText,
            message: feedbackText,
            timestamp: timestamp
          }
        })
      })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error(text || res.statusText); });
        }
        return res.text();
      })
      .then(data => console.log("Outbound User Auto-Response (EmailJS) Dispatched:", data))
      .catch(err => console.error("Outbound User Auto-Response (EmailJS) Error:", err));
    } else {
      console.log("EmailJS auto-responder is in sandbox mode or not configured. To send real auto-responses to users, please update EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in app.js.");
    }

    showState();
  });

  const viewConsoleBtn = document.getElementById("view-emails-console-btn");
  const modal = document.getElementById("email-console-modal");
  const closeModalBtn = document.getElementById("close-email-modal-btn");
  const emailTabs = document.querySelectorAll(".email-tab-btn");
  const emailPanes = document.querySelectorAll(".email-preview-pane");
  const userIframe = document.getElementById("user-email-iframe");
  const adminIframe = document.getElementById("admin-email-iframe");

  if (viewConsoleBtn && modal) {
    viewConsoleBtn.addEventListener("click", () => {
      const savedEmail = localStorage.getItem(newsletterKey) || "supporter@example.com";
      const savedFeedback = localStorage.getItem(feedbackKey) || "No suggestions provided. Subscribed for news updates.";
      const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }) + " (ICT)";

      const userEmailHTML = getUserEmailHTML(savedEmail, savedFeedback);
      const adminEmailHTML = getAdminEmailHTML(savedEmail, savedFeedback, timestamp);

      if (userIframe) {
        const doc = userIframe.contentDocument || userIframe.contentWindow.document;
        doc.open();
        doc.write(userEmailHTML);
        doc.close();
      }
      if (adminIframe) {
        const doc = adminIframe.contentDocument || adminIframe.contentWindow.document;
        doc.open();
        doc.write(adminEmailHTML);
        doc.close();
      }

      modal.classList.remove("hidden");
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
    const overlay = modal.querySelector(".email-modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => {
        modal.classList.add("hidden");
      });
    }
  }

  emailTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      emailTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-email-target");
      emailPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.remove("hidden");
        } else {
          pane.classList.add("hidden");
        }
      });
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(newsletterKey);
      localStorage.removeItem(feedbackKey);
      emailInput.value = "";
      feedbackInput.value = "";
      showState();
    });
  }

  showState();
}

function getUserEmailHTML(email, feedback) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f5f6; margin: 0; padding: 20px; }
        .email-card { max-width: 600px; background-color: #ffffff; margin: 0 auto; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #C8102E; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; }
        .content { padding: 28px; color: #333333; line-height: 1.6; font-size: 14px; }
        .feedback-quote { background-color: #f8f9fa; border-left: 4px solid #C8102E; padding: 15px; margin: 20px 0; font-style: italic; border-radius: 4px; color: #555555; }
        .footer { background-color: #111111; color: #888888; text-align: center; padding: 20px; font-size: 11px; }
        .footer p { margin: 4px 0; }
        .footer a { color: #E3D4AD; text-decoration: none; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="email-card">
        <div class="header">
          <h1>LIVERPOOL FC SUCCESS TRACKER</h1>
        </div>
        <div class="content">
          <p>Dear LFC Supporter,</p>
          <p>Thank you for subscribing to our news updates and sharing your valuable feedback with us. Your suggestions are essential to making the Liverpool FC All-Time Success Tracker a better experience for fans worldwide.</p>
          <p>Here is a summary of the feature suggestion you submitted:</p>
          <div class="feedback-quote">
            "${feedback}"
          </div>
          <p>Our development team has received your suggestion and will review it for our upcoming feature roadmap. We will keep you updated on our progress and notify you when new modules are ready for testing.</p>
          <p>Should you have any further ideas or inquiries, please do not hesitate to reach out.</p>
          <p>Best regards,<br><strong>LFC Success Tracker Development Team</strong></p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Liverpool FC Success Tracker. You'll Never Walk Alone.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getAdminEmailHTML(email, feedback, timestamp) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f5f6; margin: 0; padding: 20px; }
        .email-card { max-width: 600px; background-color: #ffffff; margin: 0 auto; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #111111; padding: 20px; text-align: center; color: #ffffff; border-bottom: 3px solid #C8102E; }
        .header h1 { margin: 0; font-size: 15px; font-weight: 700; color: #E3D4AD; letter-spacing: 1px; }
        .content { padding: 28px; color: #333333; line-height: 1.6; font-size: 14px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .meta-table th, .meta-table td { padding: 12px; border-bottom: 1px solid #e9ecef; text-align: left; }
        .meta-table th { width: 30%; color: #888888; font-weight: 700; font-size: 11px; text-transform: uppercase; }
        .meta-table td { font-size: 13px; color: #333333; }
      </style>
    </head>
    <body>
      <div class="email-card">
        <div class="header">
          <h1>LFC TRACKER - ADMIN NOTIFICATION</h1>
        </div>
        <div class="content">
          <p>Hello Administrator,</p>
          <p>A new feature suggestion and subscription request has been submitted on the Liverpool FC Success Tracker dashboard.</p>
          <table class="meta-table">
             <tr>
               <th>Source Email</th>
               <td><strong>${email}</strong></td>
             </tr>
             <tr>
               <th>Submission Time</th>
               <td>${timestamp}</td>
             </tr>
             <tr>
               <th>Feedback / Suggestions</th>
               <td>${feedback}</td>
             </tr>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Preload LFC Logo SVG for dynamic wallpaper rendering
const lfcLogoImg = new Image();
lfcLogoImg.src = "liverpool_fc_official.svg";

function initWallpaperPreview() {
  const modal = document.getElementById("wallpaper-preview-modal");
  const previewImg = document.getElementById("wallpaper-preview-img");
  const closeBtn = document.getElementById("close-wallpaper-modal-btn");
  const overlay = document.getElementById("wallpaper-preview-overlay");

  if (!modal || !previewImg) return;

  const closeModal = () => {
    modal.classList.add("hidden");
    previewImg.setAttribute("src", "");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  // Initial render of thumbnails after charts load
  setTimeout(renderWallpaperThumbnails, 800);
}

// Generate the high-resolution wallpaper on an offscreen canvas
function generateWallpaperCanvas(deviceType, callback) {
  const chartCanvas = document.getElementById("positionsChart");
  if (!chartCanvas) {
    alert("Chart not found. Please load the Overview tab first.");
    return;
  }

  const isLight = document.body.classList.contains("light-theme");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const buildWallpaper = () => {
    if (deviceType === "pc") {
      // 1920x1080 resolution
      canvas.width = 1920;
      canvas.height = 1080;

      // 1. Background
      ctx.fillStyle = isLight ? "#ffffff" : "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Faint Watermark Logo
      ctx.save();
      ctx.globalAlpha = isLight ? 0.04 : 0.07;
      const logoSize = 650;
      ctx.drawImage(lfcLogoImg, (canvas.width - logoSize) / 2, (canvas.height - logoSize) / 2, logoSize, logoSize);
      ctx.restore();

      // 3. Header Texts
      ctx.fillStyle = isLight ? "#111111" : "#ffffff";
      ctx.font = "bold 56px Montserrat, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LIVERPOOL FC", canvas.width / 2, 120);

      ctx.fillStyle = "#C8102E"; // Official LFC Red
      ctx.font = "bold 24px Montserrat, Arial, sans-serif";
      ctx.fillText("HISTORICAL LEAGUE FINISHING POSITIONS (1892 - 2026)", canvas.width / 2, 175);

      // 4. Draw Chart Canvas (Inverted, standard LFC chart)
      const chartWidth = 1520;
      const chartHeight = 720;
      const chartX = (canvas.width - chartWidth) / 2;
      const chartY = 220;

      // Draw chart border
      ctx.strokeStyle = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(chartX - 10, chartY - 10, chartWidth + 20, chartHeight + 20);

      ctx.drawImage(chartCanvas, chartX, chartY, chartWidth, chartHeight);

      // 5. Copyright & Website URL
      ctx.fillStyle = isLight ? "#555555" : "#999999";
      ctx.font = "18px Inter, Arial, sans-serif";
      ctx.fillText("© 2026 noppadol.online/liverpool-success-dashboard | You'll Never Walk Alone", canvas.width / 2, 1015);

    } else {
      // Mobile: 1080x1920 resolution
      canvas.width = 1080;
      canvas.height = 1920;

      // 1. Background
      ctx.fillStyle = isLight ? "#ffffff" : "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Faint Watermark Logo (Center background)
      ctx.save();
      ctx.globalAlpha = isLight ? 0.05 : 0.08;
      const logoSize = 750;
      ctx.drawImage(lfcLogoImg, (canvas.width - logoSize) / 2, (canvas.height - logoSize) / 2 - 120, logoSize, logoSize);
      ctx.restore();

      // 3. Header Texts
      ctx.fillStyle = isLight ? "#111111" : "#ffffff";
      ctx.font = "bold 52px Montserrat, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LIVERPOOL FC", canvas.width / 2, 280);

      ctx.fillStyle = "#C8102E"; // LFC Red
      ctx.font = "bold 22px Montserrat, Arial, sans-serif";
      ctx.fillText("LEAGUE FINISHES HISTORY", canvas.width / 2, 335);

      // 4. Draw Chart Canvas (centered vertically)
      const chartWidth = 980;
      const chartHeight = 550;
      const chartX = (canvas.width - chartWidth) / 2;
      const chartY = (canvas.height - chartHeight) / 2 - 80;

      // Draw chart border
      ctx.strokeStyle = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(chartX - 10, chartY - 10, chartWidth + 20, chartHeight + 20);

      ctx.drawImage(chartCanvas, chartX, chartY, chartWidth, chartHeight);

      // 5. YNWA Watermark Large at the bottom
      ctx.fillStyle = isLight ? "rgba(200, 16, 46, 0.06)" : "rgba(227, 27, 35, 0.06)";
      ctx.font = "bold 68px Montserrat, Arial, sans-serif";
      ctx.fillText("YOU'LL NEVER WALK ALONE", canvas.width / 2, canvas.height - 420);

      // 6. Copyright & URL
      ctx.fillStyle = isLight ? "#555555" : "#999999";
      ctx.font = "20px Inter, Arial, sans-serif";
      ctx.fillText("noppadol.online/liverpool-success-dashboard", canvas.width / 2, canvas.height - 180);
      ctx.fillText("© 2026 LFC Success Tracker", canvas.width / 2, canvas.height - 145);
    }

    callback(canvas);
  };

  // Wait for logo to load if not cached/loaded yet
  if (lfcLogoImg.complete) {
    buildWallpaper();
  } else {
    lfcLogoImg.onload = buildWallpaper;
    lfcLogoImg.onerror = buildWallpaper;
  }
}

// Global hook for wallpaper preview button click
window.previewWallpaper = function(deviceType) {
  const modal = document.getElementById("wallpaper-preview-modal");
  const previewImg = document.getElementById("wallpaper-preview-img");
  const previewTitle = document.getElementById("wallpaper-preview-title");

  if (!modal || !previewImg) return;

  generateWallpaperCanvas(deviceType, (canvas) => {
    const isLight = document.body.classList.contains("light-theme");
    const modeName = isLight ? "Light Mode" : "Dark Mode";
    const deviceName = deviceType === "pc" ? "PC Desktop" : "Mobile Screen";

    previewImg.setAttribute("src", canvas.toDataURL("image/png"));
    if (previewTitle) previewTitle.innerText = `${deviceName} (${modeName}) - Real-time Preview`;
    modal.classList.remove("hidden");
  });
};

// Global hook for wallpaper download button click
window.downloadWallpaper = function(deviceType) {
  generateWallpaperCanvas(deviceType, (canvas) => {
    const isLight = document.body.classList.contains("light-theme");
    const themeName = isLight ? "light" : "dark";
    const filename = `lfc_league_finishes_${themeName}_${deviceType}.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
};

function renderWallpaperThumbnails() {
  const pcThumb = document.getElementById("pc-wallpaper-thumb");
  const mobileThumb = document.getElementById("mobile-wallpaper-thumb");

  if (!pcThumb || !mobileThumb) return;

  // Render PC thumbnail dynamically from canvas
  generateWallpaperCanvas("pc", (canvas) => {
    pcThumb.src = canvas.toDataURL("image/png");
    pcThumb.style.opacity = "1";
  });

  // Render Mobile thumbnail dynamically from canvas
  generateWallpaperCanvas("mobile", (canvas) => {
    mobileThumb.src = canvas.toDataURL("image/png");
    mobileThumb.style.opacity = "1";
  });
}


