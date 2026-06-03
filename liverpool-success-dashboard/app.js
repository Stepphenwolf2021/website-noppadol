// app.js - Main dashboard functionality and state manager

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initCounters();
  initCharts();
  initSeasonExplorer();
  initManagerEras();
  initSquadBuilder();
  initFanPoll();
});

// 1. SPA TABS NAVIGATION
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove("active"));
      // Add active to current
      tab.classList.add("active");

      // Hide all contents
      contents.forEach(c => c.classList.remove("active"));
      // Show matching content
      const targetId = tab.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
      
      // If charts tab is loaded, make sure charts redraw if container sized changed
      if (targetId === "overview-section") {
        window.dispatchEvent(new Event('resize'));
      }

      // Reload X (Twitter) widgets if the News tab is clicked to ensure iframe renders correctly
      if (targetId === "news-section" && window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
    });
  });
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
          min: 1,
          max: 22, // Set to standard max size of English first division
          ticks: {
            stepSize: 2,
            color: "#a1a1aa",
            font: { family: "Plus Jakarta Sans", weight: 600 },
            callback: function(value) {
              const suffixes = ["st", "nd", "rd", "th"];
              return value + (suffixes[value - 1] || "th");
            }
          },
          grid: { color: "rgba(255, 255, 255, 0.05)" }
        },
        x: {
          ticks: {
            color: "#a1a1aa",
            font: { family: "Plus Jakarta Sans" },
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
          backgroundColor: "#14080a",
          titleColor: "#e2c07d",
          titleFont: { family: "Cinzel", weight: "bold" },
          bodyColor: "#f5f5f7",
          bodyFont: { family: "Plus Jakarta Sans" },
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
            color: "#a1a1aa",
            font: { family: "Plus Jakarta Sans" }
          },
          grid: { color: "rgba(255, 255, 255, 0.05)" }
        },
        x: {
          ticks: {
            color: "#a1a1aa",
            font: { family: "Plus Jakarta Sans" },
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
          backgroundColor: "#14080a",
          titleColor: "#e2c07d",
          titleFont: { family: "Cinzel", weight: "bold" },
          bodyColor: "#f5f5f7",
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
          ticks: { color: "#a1a1aa", font: { family: "Plus Jakarta Sans" } },
          grid: { color: "rgba(255, 255, 255, 0.05)" }
        },
        x: {
          ticks: {
            color: "#a1a1aa",
            font: { family: "Plus Jakarta Sans" },
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
            color: "#f5f5f7",
            font: { family: "Plus Jakarta Sans", weight: 600 }
          }
        },
        tooltip: {
          backgroundColor: "#14080a",
          bodyColor: "#f5f5f7",
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

// 5. MANAGER ERAS SELECTOR
function initManagerEras() {
  const selectorList = document.getElementById("managers-selector-list");
  
  managersData.forEach((manager, index) => {
    const btn = document.createElement("button");
    btn.className = "manager-tab-btn";
    if (index === 19) btn.classList.add("active"); // Klopp active by default
    
    btn.innerHTML = `
      <span>${manager.name}</span>
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
