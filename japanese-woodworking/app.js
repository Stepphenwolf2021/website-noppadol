// Polyfills checking for browser support
const supportsInvokers = 'commandForElement' in HTMLButtonElement.prototype;
const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

// Dynamically import Invoker commands polyfill if needed
if (!supportsInvokers) {
  import('https://cdn.jsdelivr.net/npm/invokers-polyfill@latest/dist/index.min.js')
    .then(() => console.log('Invoker Commands polyfill loaded'))
    .catch(err => console.error('Error loading Invokers polyfill:', err));
}

// 1. Initial Curated Resources Dataset
const initialResources = [
  {
    id: "ishitani-furniture",
    title: "Ishitani Furniture",
    author: "Natsuki Ishitani",
    type: "youtube",
    category: "furniture",
    url: "https://www.youtube.com/@ishitany",
    featuredVideoId: "U3vN0xY7t4o", // Making a Walnut Desk
    languages: ["ja", "en"],
    tags: ["Furniture", "Sashimono", "ASMR", "Hand Tools"],
    description: "Highly aesthetic and meditative videos documenting the fine furniture making process in a rural Japanese workshop. Features pure woodworking sounds (ASMR) with no narration, showcasing traditional joinery combined with modern machinery.",
    popularity: "2.45M+ subscribers",
    region: "Japan"
  },
  {
    id: "dylan-iwakuni",
    title: "Dylan Iwakuni",
    author: "Dylan Iwakuni",
    type: "youtube",
    category: "joinery",
    url: "https://www.youtube.com/@dylaniwakuni",
    featuredVideoId: "u83_G4VbQWc", // Making the "Impossible Joint" (Kanawa-tsugi / Shifou-Kama)
    languages: ["ja", "en"],
    tags: ["Joinery", "Kigumi", "Timber Framing", "Restoration"],
    description: "Documents traditional Japanese carpentry and timber framing techniques. Shows the intricate processes of constructing wooden buildings, creating complex interlocking joints (Kigumi) without nails, and restoring historic wooden houses.",
    popularity: "860k+ subscribers",
    region: "Japan"
  },
  {
    id: "miyadaiku-channel",
    title: "宮大工チャンネル (Miyadaiku)",
    author: "Miyadaiku Yoseijyuku",
    type: "youtube",
    category: "architecture",
    url: "https://www.youtube.com/@miyadaikuch",
    featuredVideoId: "uPHiK-0j8V0", // Training video
    languages: ["ja"],
    tags: ["Miyadaiku", "Temple Carpentry", "Apprenticeship", "Kigumi"],
    description: "The official channel of the Shrine & Temple Carpenter Training School (Miyadaiku Yoseijyuku). Focuses on teaching apprentices, maintaining architectural craftsmanship, and documenting the precision work of shrine building.",
    popularity: "110k+ subscribers",
    region: "Japan"
  },
  {
    id: "takenaka-museum-yt",
    title: "Takenaka Carpentry Tools Museum",
    author: "Takenaka Museum",
    type: "youtube",
    category: "tools",
    url: "https://www.youtube.com/@TakenakaCarpentryToolsMuseum",
    featuredVideoId: "Z4a34b2r21U", // Traditional Craftsman Tool Making
    languages: ["ja", "en"],
    tags: ["Museum", "History", "Daiku Dougu", "Documentary"],
    description: "YouTube channel of Kobe's Takenaka Carpentry Tools Museum, the only museum in Japan dedicated to carpentry tools. Features high-quality documentaries on blacksmiths, traditional master tool users, and historic architecture.",
    popularity: "165k+ subscribers",
    region: "Japan"
  },
  {
    id: "kobayashi-kenko",
    title: "小林建工 ch",
    author: "Kenji Kobayashi",
    type: "youtube",
    category: "architecture",
    url: "https://www.youtube.com/@kobayashikenkou",
    featuredVideoId: "77F52y32o7A", // Bell Tower Construction
    languages: ["ja"],
    tags: ["Miyadaiku", "Structure", "Heavy Timber", "Bell Towers"],
    description: "Documents traditional structural construction and restorations of temples, shrines, and traditional architectural gates. Focuses on heavy timber building techniques and recording carpentry knowledge for the next generation.",
    popularity: "45k+ subscribers",
    region: "Japan"
  },
  {
    id: "suikoushya-yt",
    title: "Suikoushya Woodworking",
    author: "Takami Kawai",
    type: "youtube",
    category: "joinery",
    url: "https://www.youtube.com/@suikoushya",
    featuredVideoId: "W7y8jNezF_U", // Sharpening tools
    languages: ["ja", "en"],
    tags: ["School", "Hand Tools", "Sharpening", "Kanna"],
    description: "Practical lessons in traditional Japanese woodworking. Led by Takami Kawai, the school teaches the proper posture, blade alignment, sharpening methods, and joint cuts using hand tools (saws, chisels, planes) with English subtitles.",
    popularity: "120k+ subscribers",
    region: "Japan / Kyoto"
  },
  {
    id: "somakosha",
    title: "Somakosha (杣コウシャ)",
    author: "Somakosha",
    type: "youtube",
    category: "architecture",
    url: "https://www.youtube.com/@somakosha",
    featuredVideoId: "5oJ12e0M5oE", // Shou Sugi Ban & timber joinery
    languages: ["ja", "en"],
    tags: ["Shou Sugi Ban", "Eco-Construction", "Sumi-kiri", "Wood Prep"],
    description: "Traditional carpentry, house framing, and eco-friendly timber structures. Features shou sugi ban (charred wood preservation) processes and natural, sustainable wooden construction projects.",
    popularity: "60k+ subscribers",
    region: "Japan"
  },
  {
    id: "shoyan-carpenter",
    title: "Shoyan Japanese Carpenter",
    author: "Shoyan",
    type: "youtube",
    category: "tools",
    url: "https://www.youtube.com/channel/UCdf5QHEpfrg3KydeT3iD2IQ",
    featuredVideoId: "IWHXYZwiick", // Dining area renovation
    languages: ["ja"],
    tags: ["Renovation", "Tool Setup", "Modern Carpentry", "Kanna"],
    description: "An authentic look at a modern Japanese carpenter's daily life, tool setups, and workshop routines. Demonstrates hand plane flattening, saw selection, and renovation projects.",
    popularity: "220k+ subscribers",
    region: "Japan"
  },
  {
    id: "covington-sons",
    title: "Covington & Sons",
    author: "Stanley Covington",
    type: "blog",
    category: "tools",
    url: "https://covingtonandsons.com/",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Blog", "Hand Tools", "Blacksmiths", "Steel Quality", "Sharpening"],
    description: "A legendary blog detailing Japanese tools, blacksmith history, chisels (nomi), saws (nokogiri), planes (kanna), and natural sharpening stones (toishi). Stanley shares deep insights, purchasing guides, and setup guidelines.",
    popularity: "Extremely authoritative blog",
    region: "Japan / Global"
  },
  {
    id: "the-carpentry-way",
    title: "The Carpentry Way",
    author: "Chris Hall",
    type: "blog",
    category: "joinery",
    url: "http://thecarpentryway.blogspot.com/",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Blog", "Joinery Theory", "Math", "Shoji", "Japanese Gates"],
    description: "A technical blog reviewing Japanese joinery, wood mechanics, geometrical layouts (Okuden), custom screen gates, and traditional joints. Perfect for woodworkers wanting architectural blueprints and mathematical details.",
    popularity: "Highly referenced blog",
    region: "North America"
  },
  {
    id: "takenaka-museum-web",
    title: "Takenaka Carpentry Tools Museum Portal",
    author: "Takenaka Foundation",
    type: "museum",
    category: "tools",
    url: "https://www.dougukan.jp/?lang=en",
    featuredVideoId: null,
    languages: ["ja", "en"],
    tags: ["Museum", "History", "Exhibitions", "Research"],
    description: "The official web portal of the Takenaka Carpentry Tools Museum. Hosts historical galleries, interactive tool explanations, research publications, and visitor information for their Kobe site.",
    popularity: "National Heritage Museum",
    region: "Japan / Kobe"
  },
  {
    id: "kurashige-tools",
    title: "Kurashige Tools",
    author: "Kurashige Team",
    type: "website",
    category: "tools",
    url: "https://www.kurashigetools.com/",
    featuredVideoId: null,
    languages: ["ja", "en"],
    tags: ["Shop", "Guides", "Tool Maintenance", "Blacksmith Profile"],
    description: "An online store combined with high-quality maintenance resources. Features written profiles of legendary toolmakers, instructions on setup, blade tapping (ura-dashi), and sharpening guides.",
    popularity: "World-famous tool supplier",
    region: "Japan"
  },
  {
    id: "kezuroukai-usa",
    title: "Kezurou-kai USA",
    author: "Kezurou-kai US Committee",
    type: "website",
    category: "joinery",
    url: "https://kezuroukai.us/",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Association", "Planing Competition", "Workshops", "Events"],
    description: "US branch dedicated to promoting traditional Japanese woodworking. Hosts tool workshops, hand planing competitions (Kezurikouji), and lists verified schools and teachers across North America.",
    popularity: "National Craft Organization",
    region: "USA / Global"
  },
  {
    id: "jinnai-carpentry",
    title: "Jinnai Carpentry",
    author: "Jinnai Carpentry Group",
    type: "website",
    category: "architecture",
    url: "https://jinnaicarpentry.com/",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Timber Framing", "Shoji", "Tea Houses", "Architecture"],
    description: "A showcase of traditional construction in North America. Features timber frames, shoji screens, tea houses, and heavy-timber gates built using traditional Japanese joinery and layouts.",
    popularity: "Bespoke Carpentry Studio",
    region: "USA / Canada"
  },
  {
    id: "douglas-brooks-boats",
    title: "Douglas Brooks Boatbuilding",
    author: "Douglas Brooks",
    type: "blog",
    category: "boatbuilding",
    url: "https://www.douglasbrooksboatbuilding.com/",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Blog", "Boat Building", "Apprentice", "Historic Crafts"],
    description: "Fascinating blog documenting Douglas Brooks' apprenticeships with the last traditional boatbuilders in Japan. Focuses on Japanese tub boats (tarubune), wooden sails, and apprentice-based wood learning.",
    popularity: "Pioneering researcher & author",
    region: "USA / Japan"
  },
  {
    id: "tenons-tenors-sashigane",
    title: "Tenons & Tenors: Sashigane Guide",
    author: "Tenons & Tenors",
    type: "youtube",
    category: "tools",
    url: "https://www.youtube.com/watch?v=i__oDChKPzA",
    featuredVideoId: "i__oDChKPzA",
    languages: ["ja", "en"],
    tags: ["Sashigane", "Compound Angles", "Circumference", "Kikujutsu"],
    description: "A highly recommended bilingual video explaining how to use the traditional Sashigane square to calculate circle circumferences, run square-root layouts, and map complex compound angles on timber joints.",
    popularity: "Bilingual Sashigane Video",
    region: "Global"
  },
  {
    id: "rexs-tools-sashigane",
    title: "Rex's Tools - Sashigane Series",
    author: "Rex's Tools",
    type: "blog",
    category: "tools",
    url: "https://rexs.tools/",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Blog", "Sashigane", "Tool Anatomy", "Layout Math", "Kikujutsu"],
    description: "A comprehensive written series covering the history, structural anatomy, and geometric mathematics behind the Sashigane square. Features diagrams detailing metric/shaku scales, right triangles, and structural joints.",
    popularity: "In-depth Sashigane Article",
    region: "Global"
  },
  {
    id: "book-toshio-odate",
    title: "Japanese Woodworking Tools: Their Tradition, Spirit, and Use",
    author: "Toshio Odate",
    type: "book",
    category: "tools",
    url: "https://www.amazon.com/Japanese-Woodworking-Tools-Tradition-Spirit/dp/0854420754",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Book", "Hand Tools", "History", "Sharpening", "Spirit"],
    description: "Considered the bible for Western woodworkers entering the world of Japanese hand tools. Toshio Odate explains the context, blacksmith traditions, preparation, sharpening, and proper usage of kanna, nomi, and nokogiri.",
    popularity: "Highly Recommended Classic Book",
    region: "Global"
  },
  {
    id: "book-yasuo-nakahara",
    title: "The Complete Japanese Joinery",
    author: "Yasuo Nakahara",
    type: "book",
    category: "joinery",
    url: "https://www.amazon.com/Complete-Japanese-Joinery-Yasuo-Nakahara/dp/0881791210",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Book", "Joinery Diagrams", "Blueprints", "Kigumi", "Shiguchi"],
    description: "An incredibly comprehensive reference manual that covers the layout, cutting, and assembly of more than 100 traditional joints. Ideal for timber framers and carpenters.",
    popularity: "Essential Reference Book",
    region: "Global"
  },
  {
    id: "book-azby-brown",
    title: "The Genius of Japanese Carpentry",
    author: "S. Azby Brown",
    type: "book",
    category: "architecture",
    url: "https://www.amazon.com/Genius-Japanese-Carpentry-Secrets-Architecture/dp/4805312761",
    featuredVideoId: null,
    languages: ["en"],
    tags: ["Book", "Temple Architecture", "Miyadaiku", "History", "Philosophy"],
    description: "An elegant exploration of traditional Japanese temple building, detailing the rebuilding of Yakushiji temple. Focuses on the work of master carpenters, planning, tools, and the forest sustainability ethics.",
    popularity: "Architectural & Historical Book",
    region: "Japan / Global"
  },
  {
    id: "book-takenaka-dougu",
    title: "和の道具・木工用具と使い方 (Traditional Japanese Woodworking Tools)",
    author: "Takenaka Carpentry Tools Museum",
    type: "book",
    category: "tools",
    url: "https://www.dougukan.jp/",
    featuredVideoId: null,
    languages: ["ja"],
    tags: ["Book", "大工道具", "Daiku Dougu", "Takenaka Museum", "Sharpening"],
    description: "หนังสือภาษาญี่ปุ่นอย่างเป็นทางการโดยพิพิธภัณฑ์เครื่องมือช่างไม้ Takenaka อธิบายประเภท ประวัติศาสตร์ และวิธีการใช้งานเครื่องมือช่างไม้แบบโบราณอย่างละเอียด พร้อมภาพประกอบที่ชัดเจน (An authoritative Japanese-language guide detailing the classification, history, and usage of traditional handtools).",
    popularity: "Museum Published Book",
    region: "Japan"
  },
  {
    id: "book-ryozo-ishii",
    title: "図解 木造建物の継手と仕口 (Illustrated Timber Joinery: Tsugite & Shiguchi)",
    author: "Ryozo Ishii (石井 良三)",
    type: "book",
    category: "joinery",
    url: "https://www.amazon.co.jp/dp/476152191X",
    featuredVideoId: null,
    languages: ["ja"],
    tags: ["Book", "木組み", "Kigumi", "継手・仕口", "Tsugite", "Shiguchi"],
    description: "คู่มือภาษาญี่ปุ่นคลาสสิกที่รวบรวมแผนผังการทำรอยต่อไม้แบบโบราณ ทั้งรอยต่อกลางไม้ (Tsugite) และรอยต่อชนมุม (Shiguchi) อธิบายทฤษฎีการกระจายน้ำหนักและการเข้าไม้แบบดั้งเดิม (The ultimate classic Japanese guide detailing traditional framing joints with structural diagrams).",
    popularity: "Classic Technical Book",
    region: "Japan"
  },
  {
    id: "book-hiroshi-uchida",
    title: "規矩術の基礎と応用 (Kikujutsu: Foundations and Application)",
    author: "Hiroshi Uchida (内田 弘)",
    type: "book",
    category: "architecture",
    url: "https://www.amazon.co.jp/s?k=%E8%A6%8F%E7%9F%A9%E8%A1%93%E3%81%AE%E5%9F%BA%E7%A4%8E%E3%81%A8%E5%BF%9C%E7%94%A8",
    featuredVideoId: null,
    languages: ["ja"],
    tags: ["Book", "規矩術", "Kikujutsu", "Sashigane", "Roof Layout"],
    description: "ตำราวิชาคิกุจุสึ (Kikujutsu) ภาษาญี่ปุ่น อธิบายการใช้ไม้ฉาก Sashigane คำนวณองศาซับซ้อนสำหรับงานวางโครงหลังคาวัดและศาลเจ้าญี่ปุ่นดั้งเดิม (A detailed Japanese textbook explaining roof framing geometric calculations using the sashigane).",
    popularity: "Kikujutsu Textbook",
    region: "Japan"
  },
  {
    id: "archive-hokusai-tatekawa",
    title: "Fuji from Tatekawa in Honjo (本所立川)",
    author: "Katsushika Hokusai (葛飾 北斎)",
    type: "archive",
    category: "tools",
    url: "https://commons.wikimedia.org/wiki/File:Tatekawa_in_Honjo.jpg",
    featuredVideoId: null,
    languages: ["ja", "en"],
    tags: ["Ukiyo-e", "Lumberyard", "Edo Period", "Saws", "Art", "Public Domain"],
    description: "ภาพเขียนประวัติศาสตร์ยุคเอโดะจากชุด 'ทัศนียภาพ 36 มุมของภูเขาไฟฟูจิ' (ปี 1830) แสดงภาพคนงานทำไม้ญี่ปุ่นกำลังใช้เลื่อยโบราณผ่าท่อนไม้ใหญ่ และช่างไสไม้ทำงานร่วมกันโดยมีภูเขาไฟฟูจิเป็นฉากหลัง (A masterpiece public domain woodblock print depicting Edo-era woodworkers and carpenters at a lumberyard).",
    popularity: "Famous Woodblock Print (c.1830)",
    region: "Japan"
  },
  {
    id: "archive-hokusai-manga-carpentry",
    title: "Carpenters at Work (Hokusai Manga Sketches)",
    author: "Katsushika Hokusai (葛飾 北斎)",
    type: "archive",
    category: "tools",
    url: "https://commons.wikimedia.org/wiki/File:Hokusai_Manga_Vol.3_Carpenters.jpg",
    featuredVideoId: null,
    languages: ["ja", "en"],
    tags: ["Art", "Sketches", "Carpenters", "Hand Tools", "History", "Public Domain"],
    description: "ภาพสเก็ตช์ลายเส้นพู่กันฝีมือโฮคุไซจากสมุดภาพ Hokusai Manga เล่ม 3 (ปี 1815) แสดงอากัปกิริยา ท่าทาง และการใช้เครื่องมือต่างๆ ของช่างไม้เอโดะ เช่น ขวานโยน (Chona) และสิ่วเจาะ (Nomi) (Public domain brush sketches capturing the authentic tool handling postures of traditional carpenters).",
    popularity: "Historic Art Sketches (1815)",
    region: "Japan"
  },
  {
    id: "archive-shomei-scroll",
    title: "匠明 (Shomei Carpentry Scroll Manual)",
    author: "Heinouchi Family (平内家)",
    type: "archive",
    category: "architecture",
    url: "https://commons.wikimedia.org/wiki/File:Shomei_Carpentry_Scroll.jpg",
    featuredVideoId: null,
    languages: ["ja"],
    tags: ["Scroll", "Kikujutsu", "Manual", "Temple Carpentry", "Blueprints", "Public Domain"],
    description: "คัมภีร์ตำราเขียนแบบช่างไม้ดั้งเดิม 5 เล่ม รวบรวมในปี 1608 โดยตระกูลเฮโนอุจิ (ช่างใหญ่ของโชกุน) บันทึกสูตรลับการคำนวณสัดส่วนวิหารเจดีย์และวิธีการเข้าลิ่มไม้ (Kigumi) สำหรับสถาปัตยกรรมวัดญี่ปุ่นโบราณ (A famous 17th-century carpentry treatise detailing temple proportions and joinery formulas).",
    popularity: "Edo Period Master Manual (1608)",
    region: "Japan"
  }
];

// 2. State Management
let resources = [];
let bookmarks = [];
let activeTag = null;

// Initialize State
function initState() {
  // Load bookmarks
  const storedBookmarks = localStorage.getItem('daiku_bookmarks');
  bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

  // Load custom resources
  const storedCustom = localStorage.getItem('daiku_custom_resources');
  const customResources = storedCustom ? JSON.parse(storedCustom) : [];

  // Combine initial and custom
  resources = [...initialResources, ...customResources];

  // Set Theme
  const storedTheme = localStorage.getItem('daiku_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', storedTheme);
  updateThemeIcon(storedTheme);
}

// 3. Fallbacks for Dialog controls (Invoker Commands helper)
function setupModalFallbacks() {
  // Backdrop close fallback for browsers without native closedby="any"
  if (!supportsClosedBy) {
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isClickInside = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isClickInside) {
          dialog.close();
        }
      });
    });
  }

  // Click-based Invoker fallback for browsers without native invokers
  if (!supportsInvokers) {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[commandfor], a[commandfor]');
      if (!button) return;

      const targetId = button.getAttribute('commandfor');
      const command = button.getAttribute('command');
      const dialog = document.getElementById(targetId);

      if (dialog && command) {
        event.preventDefault(); // Prevent jump/submit
        if (command === 'show-modal') {
          dialog.showModal();
        } else if (command === 'close') {
          dialog.close();
        }
      }
    });
  }
}

// 4. Render Layout Cards
function renderDashboard() {
  const grid = document.getElementById('resources-grid');
  const searchVal = document.getElementById('search-input').value.toLowerCase();
  const categoryVal = document.getElementById('filter-category').value;
  const languageVal = document.getElementById('filter-language').value;
  const typeVal = document.getElementById('filter-type').value;
  const sortVal = document.getElementById('sort-order').value;
  const favoritesOnly = document.getElementById('favorites-toggle').classList.contains('active');

  // Filter
  let filtered = resources.filter(res => {
    // Search match
    const matchesSearch = 
      res.title.toLowerCase().includes(searchVal) ||
      res.author.toLowerCase().includes(searchVal) ||
      res.description.toLowerCase().includes(searchVal) ||
      res.tags.some(tag => tag.toLowerCase().includes(searchVal));

    // Category match
    const matchesCategory = categoryVal === 'all' || res.category === categoryVal;

    // Language match
    let matchesLanguage = true;
    if (languageVal !== 'all') {
      if (languageVal === 'multi') {
        matchesLanguage = res.languages.length > 1 || res.tags.includes('ASMR');
      } else {
        matchesLanguage = res.languages.includes(languageVal);
      }
    }

    // Type match
    const matchesType = typeVal === 'all' || res.type === typeVal;

    // Favorites match
    const matchesFavorite = !favoritesOnly || bookmarks.includes(res.id);

    // Active Tag Cloud match
    const matchesActiveTag = !activeTag || res.tags.includes(activeTag);

    return matchesSearch && matchesCategory && matchesLanguage && matchesType && matchesFavorite && matchesActiveTag;
  });

  // Sort
  if (sortVal === 'az') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortVal === 'popularity') {
    // Basic sorting based on popularity strings (YouTube subs first)
    filtered.sort((a, b) => {
      const aVal = a.popularity.includes('M') ? parseFloat(a.popularity) * 1000000 : 
                   a.popularity.includes('k') ? parseFloat(a.popularity) * 1000 : 100;
      const bVal = b.popularity.includes('M') ? parseFloat(b.popularity) * 1000000 : 
                   b.popularity.includes('k') ? parseFloat(b.popularity) * 1000 : 100;
      return bVal - aVal;
    });
  }

  // Update Stats Counters
  document.getElementById('visible-count').textContent = filtered.length;
  document.getElementById('total-count').textContent = resources.length;

  if (currentView === 'graph') {
    updateGraphData(filtered);
    return;
  }

  // Render Grid Content
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No Woodworking Resources Found</h3>
        <p>Try adjusting your search criteria, clearing the filters, or disabling "Bookmarks Only".</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(res => {
    const isBookmarked = bookmarks.includes(res.id);
    const typeLabel = res.type === 'youtube' ? 'YouTube' : 
                      res.type === 'museum' ? 'Museum' : 
                      res.type === 'blog' ? 'Blog' : 'Website';
    
    const langBadges = res.languages.map(l => {
      const code = l.toUpperCase();
      const flag = code === 'JA' ? '🇯🇵' : code === 'EN' ? '🇺🇸' : code === 'TH' ? '🇹🇭' : '🌐';
      return `<span class="lang-tag" title="${code}">${flag} ${code}</span>`;
    }).join(' ');

    const miniTags = res.tags.slice(0, 3).map(t => `<span class="mini-tag">#${t}</span>`).join(' ');

    return `
      <article class="resource-card" data-id="${res.id}">
        <div class="card-header">
          <span class="type-badge ${res.type}">${typeLabel}</span>
          <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${res.id}" aria-label="Bookmark ${res.title}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
        </div>
        <h3 class="card-title">${res.title}</h3>
        <div class="card-author">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          ${res.author}
        </div>
        <p class="card-desc">${res.description}</p>
        <div class="card-tags">${miniTags}</div>
        <div class="card-footer">
          <div class="languages-list">${langBadges}</div>
          <button class="btn btn-card-details" data-id="${res.id}">Details</button>
        </div>
      </article>
    `;
  }).join('');

  // Wire up Details Buttons inside newly rendered cards
  document.querySelectorAll('.btn-card-details').forEach(btn => {
    btn.addEventListener('click', () => {
      openDetailsModal(btn.getAttribute('data-id'));
    });
  });

  // Wire up Bookmarks click events
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookmark(btn.getAttribute('data-id'));
    });
  });
}

// 5. Open Details Modal & Handle YouTube Embed
function openDetailsModal(id) {
  const res = resources.find(r => r.id === id);
  if (!res) return;

  const modal = document.getElementById('details-modal');
  document.getElementById('details-title').textContent = res.title;
  document.getElementById('details-author').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    ${res.author} (${res.region})
  `;
  document.getElementById('details-subs').textContent = res.popularity;
  
  const typeBadge = document.getElementById('details-type');
  typeBadge.className = `type-badge ${res.type}`;
  typeBadge.textContent = res.type.toUpperCase();

  document.getElementById('details-description').textContent = res.description;

  // Render Tags
  const tagsBox = document.getElementById('details-tags');
  tagsBox.innerHTML = res.tags.map(t => `<span class="mini-tag" style="font-size: 0.85rem; padding: 0.25rem 0.6rem; cursor: pointer;">#${t}</span>`).join(' ');

  // Video embed setup
  const videoBox = document.getElementById('modal-video-container');
  if (res.type === 'youtube' && res.featuredVideoId) {
    videoBox.style.display = 'block';
    videoBox.innerHTML = `
      <iframe 
        src="https://www.youtube-nocookie.com/embed/${res.featuredVideoId}?autoplay=0&modestbranding=1&rel=0" 
        title="${res.title} Featured Video" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
  } else {
    videoBox.style.display = 'none';
    videoBox.innerHTML = '';
  }

  // Visit link setup
  document.getElementById('details-visit-link').setAttribute('href', res.url);

  // Close event listener to clean up iframe (stop audio playing in background)
  modal.addEventListener('close', () => {
    videoBox.innerHTML = '';
  }, { once: true });

  modal.showModal();
}

// 6. Toggle Bookmark function
function toggleBookmark(id) {
  const index = bookmarks.indexOf(id);
  if (index === -1) {
    bookmarks.push(id);
  } else {
    bookmarks.splice(index, 1);
  }

  localStorage.setItem('daiku_bookmarks', JSON.stringify(bookmarks));
  renderDashboard();
}

// 7. Render dynamic Tag Cloud in filter panel
function renderTagCloud() {
  const tagCloud = document.getElementById('tag-cloud');
  const allTags = new Set();
  
  resources.forEach(res => {
    res.tags.forEach(tag => allTags.add(tag));
  });

  const sortedTags = Array.from(allTags).sort();

  tagCloud.innerHTML = `
    <button class="tag-btn ${!activeTag ? 'active' : ''}" id="tag-all-btn">All Tags</button>
    ${sortedTags.map(tag => `
      <button class="tag-btn ${activeTag === tag ? 'active' : ''}" data-tag="${tag}">${tag}</button>
    `).join('')}
  `;

  // Tag click events
  document.getElementById('tag-all-btn').addEventListener('click', () => {
    activeTag = null;
    renderTagCloud();
    renderDashboard();
  });

  tagCloud.querySelectorAll('.tag-btn[data-tag]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      activeTag = activeTag === tag ? null : tag; // Toggle behavior
      renderTagCloud();
      renderDashboard();
    });
  });
}

// 8. Theme Toggle logic
function setupThemeToggler() {
  const toggleBtn = document.getElementById('theme-toggle');

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('daiku_theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (theme === 'light') {
    toggleBtn.innerHTML = `
      <svg class="sun-moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
  } else {
    toggleBtn.innerHTML = `
      <svg class="sun-moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
  }
}

// 9. Interactive SVG Joint Animation Logic
function setupJointAnimation() {
  const jointWidget = document.getElementById('joint-widget');
  const jointSvg = document.getElementById('joint-svg');
  const jointStatus = document.getElementById('joint-status');

  jointWidget.addEventListener('click', () => {
    const isUnlocked = jointSvg.classList.toggle('unlocked');
    if (isUnlocked) {
      jointStatus.textContent = 'Unlocked';
      jointStatus.style.color = 'var(--accent-hover)';
    } else {
      jointStatus.textContent = 'Locked';
      jointStatus.style.color = '';
    }
  });
}

// 10. Form Submission (Add Custom Resource)
function setupFormSubmission() {
  const form = document.getElementById('add-resource-form');
  const modal = document.getElementById('add-resource-modal');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Gather selected languages
    const langCheckboxes = document.querySelectorAll('input[name="form-lang"]:checked');
    const languages = Array.from(langCheckboxes).map(cb => cb.value);

    if (languages.length === 0) {
      alert('Please select at least one language.');
      return;
    }

    // Process comma tags
    const tagsString = document.getElementById('form-tags').value;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
    // Ensure default tags are neat
    if (tags.length === 0) {
      tags.push('Custom');
    }

    const newResource = {
      id: "custom-" + Date.now(),
      title: document.getElementById('form-title').value.trim(),
      author: document.getElementById('form-author').value.trim(),
      type: document.getElementById('form-type').value,
      category: document.getElementById('form-category').value,
      url: document.getElementById('form-url').value.trim(),
      featuredVideoId: document.getElementById('form-youtube-id').value.trim() || null,
      languages: languages,
      tags: tags,
      description: document.getElementById('form-description').value.trim(),
      popularity: document.getElementById('form-popularity').value.trim() || "User Contributed",
      region: "Global"
    };

    // Save to Local Storage
    const storedCustom = localStorage.getItem('daiku_custom_resources');
    const customResources = storedCustom ? JSON.parse(storedCustom) : [];
    customResources.push(newResource);
    localStorage.setItem('daiku_custom_resources', JSON.stringify(customResources));

    // Update state and refresh
    resources.push(newResource);
    renderDashboard();
    renderTagCloud();

    // Reset Form & Close Modal
    form.reset();
    modal.close();
  });
}

// 11. Event Listeners for Filters
function setupFilterListeners() {
  document.getElementById('search-input').addEventListener('input', renderDashboard);
  document.getElementById('filter-category').addEventListener('change', renderDashboard);
  document.getElementById('filter-language').addEventListener('change', renderDashboard);
  document.getElementById('filter-type').addEventListener('change', renderDashboard);
  document.getElementById('sort-order').addEventListener('change', renderDashboard);
  
  // Bookmarks Toggle button
  const faveToggle = document.getElementById('favorites-toggle');
  faveToggle.addEventListener('click', () => {
    faveToggle.classList.toggle('active');
    renderDashboard();
  });
}

// Core Entry Point
document.addEventListener('DOMContentLoaded', () => {
  initState();
  setupModalFallbacks();
  setupFilterListeners();
  setupFormSubmission();
  setupThemeToggler();
  setupJointAnimation();
  setupViewSwitcher();

  // Initial Renders
  renderDashboard();
  renderTagCloud();
});

// ==========================================
// 12. Interactive Canvas Graph View Engine
// ==========================================

// Graph view state variables
let currentView = 'grid';
let canvas = null;
let ctx = null;
let graphContainer = null;
let nodes = [];
let links = [];
let isSimulating = false;
let draggedNode = null;
let hoveredNode = null;
let dragStartX = 0;
let dragStartY = 0;
let mousePos = { x: 0, y: 0 };
let hasInitializedGraph = false;

// Viewport zoom & pan offset state
let zoomScale = 1.0;
let panOffset = { x: 0, y: 0 };
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

// Graph navigation state
let activeFocusNodeId = null;
let lastSearchTerm = '';
let lastFilteredResources = [];

function startSimulation() {
  if (!isSimulating && nodes.length > 0) {
    isSimulating = true;
    requestAnimationFrame(simulationTick);
  }
}

function setupViewSwitcher() {
  const gridBtn = document.getElementById('view-grid-btn');
  const graphBtn = document.getElementById('view-graph-btn');
  const gridContainer = document.getElementById('resources-grid');
  graphContainer = document.getElementById('graph-view-container');

  gridBtn.addEventListener('click', () => {
    if (currentView === 'grid') return;
    currentView = 'grid';
    gridBtn.classList.add('active');
    graphBtn.classList.remove('active');
    gridContainer.style.display = 'grid';
    graphContainer.style.display = 'none';
    isSimulating = false;
    renderDashboard();
  });

  graphBtn.addEventListener('click', () => {
    if (currentView === 'graph') return;
    currentView = 'graph';
    graphBtn.classList.add('active');
    gridBtn.classList.remove('active');
    gridContainer.style.display = 'none';
    graphContainer.style.display = 'block';
    
    if (!hasInitializedGraph) {
      initGraphView();
      hasInitializedGraph = true;
    }
    
    resizeCanvas();
    renderDashboard();
  });
}

function initGraphView() {
  canvas = document.getElementById('graph-canvas');
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', () => {
    if (currentView === 'graph') {
      resizeCanvas();
    }
  });

  // Mouse and wheel event listeners
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // Hook up simulation control panel elements
  setupControlsPanel();
}

function onWheel(e) {
  if (currentView !== 'graph' || !canvas) return;
  e.preventDefault();
  
  const rect = canvas.getBoundingClientRect();
  const mX = e.clientX - rect.left;
  const mY = e.clientY - rect.top;

  // Convert cursor position to graph coordinates before zooming
  const graphX = (mX - panOffset.x) / zoomScale;
  const graphY = (mY - panOffset.y) / zoomScale;

  // Determine zoom direction and factor
  const zoomFactor = 1.1;
  let newScale = e.deltaY < 0 ? zoomScale * zoomFactor : zoomScale / zoomFactor;

  // Bound scale from 0.3x to 4.0x
  newScale = Math.max(0.3, Math.min(4.0, newScale));

  // Adjust panOffset so that the point under the cursor remains at the same visual position
  panOffset.x = mX - graphX * newScale;
  panOffset.y = mY - graphY * newScale;
  zoomScale = newScale;

  // Redraw when zoom changes and simulation is stopped
  if (!isSimulating) {
    drawGraph();
  }
}

function setupControlsPanel() {
  const panel = document.getElementById('graph-controls-panel');
  const toggle = document.getElementById('controls-toggle');
  
  // Collapse/Expand toggle
  toggle.addEventListener('click', () => {
    panel.classList.toggle('collapsed');
  });

  // Reset Focus button
  const resetFocusBtn = document.getElementById('btn-reset-focus');
  if (resetFocusBtn) {
    resetFocusBtn.addEventListener('click', () => {
      activeFocusNodeId = lastSearchTerm ? 'root_search' : 'root_hub';
      updateGraphData(lastFilteredResources);
    });
  }

  // Reset View button
  const resetBtn = document.getElementById('btn-reset-view');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      zoomScale = 1.0;
      panOffset = { x: 0, y: 0 };
      drawGraph();
    });
  }
}

function resizeCanvas() {
  if (!canvas || !graphContainer) return;
  canvas.width = graphContainer.clientWidth;
  canvas.height = graphContainer.clientHeight;
}

function updateGraphData(filteredResources) {
  if (!canvas) return;

  // Cache filtered resources for focus resets
  lastFilteredResources = filteredResources;

  const searchInputVal = document.getElementById('search-input').value.trim();
  if (searchInputVal !== lastSearchTerm) {
    lastSearchTerm = searchInputVal;
    activeFocusNodeId = searchInputVal ? 'root_search' : 'root_hub';
  }

  // Build ontology database
  const { allNodes, allLinks } = getOntologyDatabase(searchInputVal);

  let focusNode = allNodes.get(activeFocusNodeId);
  if (!focusNode) {
    activeFocusNodeId = searchInputVal ? 'root_search' : 'root_hub';
    focusNode = allNodes.get(activeFocusNodeId);
  }

  // Find neighbors connected directly to the focused concept
  const activeNeighbors = [];
  const activeLinks = [];

  allLinks.forEach(link => {
    if (link.sourceId === focusNode.id) {
      const targetNode = allNodes.get(link.targetId);
      if (targetNode && !activeNeighbors.some(n => n.id === targetNode.id)) {
        activeNeighbors.push(targetNode);
        activeLinks.push({ sourceId: focusNode.id, targetId: targetNode.id, relation: link.relation });
      }
    } else if (link.targetId === focusNode.id) {
      const sourceNode = allNodes.get(link.sourceId);
      if (sourceNode && !activeNeighbors.some(n => n.id === sourceNode.id)) {
        activeNeighbors.push(sourceNode);
        activeLinks.push({ sourceId: sourceNode.id, targetId: focusNode.id, relation: link.relation });
      }
    }
  });

  // Add the root node as a neighbor to non-root focused nodes to allow going back!
  const rootId = searchInputVal ? 'root_search' : 'root_hub';
  if (focusNode.id !== rootId) {
    const rootNode = allNodes.get(rootId);
    if (rootNode && !activeNeighbors.some(n => n.id === rootNode.id)) {
      activeNeighbors.push(rootNode);
      activeLinks.push({ sourceId: focusNode.id, targetId: rootNode.id, relation: 'parent' });
    }
  }

  // Calculate coordinates using focused radial layout
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  focusNode.targetX = centerX;
  focusNode.targetY = centerY;

  const R = Math.min(canvas.width, canvas.height) * 0.35;
  const N = activeNeighbors.length;
  activeNeighbors.forEach((nb, i) => {
    const angle = (i * Math.PI * 2) / N;
    nb.targetX = centerX + Math.cos(angle) * R;
    nb.targetY = centerY + Math.sin(angle) * R;
  });

  // Preserve positions for nodes that are already in the graph to transition them smoothly
  const oldNodesMap = new Map();
  nodes.forEach(n => oldNodesMap.set(n.id, n));

  const newNodesList = [];

  // Focus Node positioning
  if (oldNodesMap.has(focusNode.id)) {
    const oldNode = oldNodesMap.get(focusNode.id);
    focusNode.x = oldNode.x;
    focusNode.y = oldNode.y;
  } else {
    focusNode.x = centerX;
    focusNode.y = centerY;
  }
  newNodesList.push(focusNode);

  // Neighbors positioning (grows out from center node's previous/current position)
  activeNeighbors.forEach(nb => {
    if (oldNodesMap.has(nb.id)) {
      const oldNode = oldNodesMap.get(nb.id);
      nb.x = oldNode.x;
      nb.y = oldNode.y;
    } else {
      nb.x = focusNode.x;
      nb.y = focusNode.y;
    }
    newNodesList.push(nb);
  });

  nodes = newNodesList;

  // Map active links to node objects for rendering
  links = activeLinks.map(link => {
    const sNode = nodes.find(n => n.id === link.sourceId);
    const tNode = nodes.find(n => n.id === link.targetId);
    return {
      source: sNode,
      target: tNode,
      relation: link.relation
    };
  }).filter(l => l.source && l.target);

  startSimulation();
}

function getCategoryName(catId) {
  const catNames = {
    furniture: "Furniture Making",
    joinery: "Joinery & Carpentry",
    tools: "Tools & Maintenance",
    architecture: "Traditional Architecture",
    boatbuilding: "Boat Building"
  };
  return catNames[catId] || catId;
}

function getOntologyDatabase(searchTerm) {
  const allNodes = new Map();
  const allLinks = []; // array of { sourceId, targetId, relation }

  // 1. Create root node
  if (searchTerm) {
    const rootId = 'root_search';
    allNodes.set(rootId, {
      id: rootId,
      label: `Search: "${searchTerm}"`,
      type: 'root',
      radius: 25
    });
  } else {
    const rootId = 'root_hub';
    allNodes.set(rootId, {
      id: rootId,
      label: 'Daiku Hub',
      type: 'root',
      radius: 25
    });
  }

  // 2. Add Category nodes
  const categories = ['furniture', 'joinery', 'tools', 'architecture', 'boatbuilding'];
  categories.forEach(cat => {
    const catId = `cat_${cat}`;
    allNodes.set(catId, {
      id: catId,
      label: getCategoryName(cat),
      type: 'category',
      radius: 20,
      categoryKey: cat
    });
    // Link root to categories (if no search)
    if (!searchTerm) {
      allLinks.push({ sourceId: 'root_hub', targetId: catId, relation: 'contains' });
    }
  });

  // 3. Add Resources, Creators, and Tags
  const searchLower = searchTerm ? searchTerm.toLowerCase() : '';
  resources.forEach(res => {
    const resId = `res_${res.id}`;
    allNodes.set(resId, {
      id: resId,
      label: res.title,
      type: 'resource',
      radius: 18,
      refId: res.id,
      resourceData: res
    });

    // Link resource to its category
    const catId = `cat_${res.category}`;
    allLinks.push({ sourceId: resId, targetId: catId, relation: 'belongsTo' });

    // Link resource to its creator
    const creatorId = `creator_${res.author}`;
    if (!allNodes.has(creatorId)) {
      allNodes.set(creatorId, {
        id: creatorId,
        label: res.author,
        type: 'creator',
        radius: 14,
        creatorName: res.author
      });
    }
    allLinks.push({ sourceId: resId, targetId: creatorId, relation: 'createdBy' });

    // Link resource to its tags
    res.tags.forEach(tag => {
      const tagId = `tag_${tag}`;
      if (!allNodes.has(tagId)) {
        allNodes.set(tagId, {
          id: tagId,
          label: `#${tag}`,
          type: 'tag',
          radius: 11,
          tagName: tag
        });
      }
      allLinks.push({ sourceId: resId, targetId: tagId, relation: 'hasTag' });
    });

    // If search is active, check if this resource matches the search
    if (searchTerm) {
      const matches = 
        res.title.toLowerCase().includes(searchLower) ||
        res.author.toLowerCase().includes(searchLower) ||
        res.description.toLowerCase().includes(searchLower) ||
        res.tags.some(t => t.toLowerCase().includes(searchLower)) ||
        getCategoryName(res.category).toLowerCase().includes(searchLower);

      if (matches) {
        allLinks.push({ sourceId: 'root_search', targetId: resId, relation: 'matches' });
      }
    }
  });

  // Link search root to matching tags/creators/categories
  if (searchTerm) {
    allNodes.forEach(node => {
      if (node.id === 'root_search') return;
      if (node.label.toLowerCase().includes(searchLower) && node.type !== 'resource') {
        allLinks.push({ sourceId: 'root_search', targetId: node.id, relation: 'matches' });
      }
    });
  }

  return { allNodes, allLinks };
}

function simulationTick() {
  if (currentView !== 'graph' || !canvas) {
    isSimulating = false;
    return;
  }

  let moved = false;
  nodes.forEach(node => {
    const dx = node.targetX - node.x;
    const dy = node.targetY - node.y;
    // Asymptotic transition with no bounce
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      node.x += dx * 0.15;
      node.y += dy * 0.15;
      moved = true;
    } else {
      node.x = node.targetX;
      node.y = node.targetY;
    }
  });

  drawGraph();

  if (moved) {
    requestAnimationFrame(simulationTick);
  } else {
    isSimulating = false;
  }
}

function drawGraph() {
  if (!ctx || !canvas) return;

  // Clear Canvas (using full screenspace bounds)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Apply zoom and pan offset transformations
  ctx.translate(panOffset.x, panOffset.y);
  ctx.scale(zoomScale, zoomScale);

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  // Styles based on theme
  const linkColorNormal = theme === 'light' ? '#e3dcd3' : '#332822';
  const linkColorHighlight = theme === 'light' ? '#b0693a' : 'var(--accent)';
  const nodeTextMuted = theme === 'light' ? '#73635a' : '#a89c94';
  const nodeTextActive = theme === 'light' ? '#2b1f1a' : '#f5efe9';
  const tagFillColor = theme === 'light' ? 'rgba(109, 162, 248, 0.15)' : 'rgba(109, 162, 248, 0.1)';
  const tagStrokeColor = '#6da2f8';

  // 1. Draw Links (Edges) and Relationship Label Pills
  links.forEach(link => {
    const isHighlighted = hoveredNode && (link.source === hoveredNode || link.target === hoveredNode);

    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    
    if (isHighlighted) {
      ctx.strokeStyle = linkColorHighlight;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = linkColorHighlight;
    } else {
      ctx.strokeStyle = linkColorNormal;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Draw Relation Label on edge midpoint
    if (link.relation) {
      const midX = (link.source.x + link.target.x) / 2;
      const midY = (link.source.y + link.target.y) / 2;
      
      ctx.save();
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const labelText = link.relation;
      const textWidth = ctx.measureText(labelText).width;
      
      // Draw background pill
      ctx.fillStyle = theme === 'light' ? '#f6f1eb' : '#221813';
      ctx.strokeStyle = theme === 'light' ? '#e3dcd3' : '#332822';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      const rectW = textWidth + 8;
      const rectH = 12;
      const rx = midX - rectW / 2;
      const ry = midY - rectH / 2;
      ctx.roundRect ? ctx.roundRect(rx, ry, rectW, rectH, 3) : ctx.rect(rx, ry, rectW, rectH);
      ctx.fill();
      ctx.stroke();
      
      // Draw text
      ctx.fillStyle = theme === 'light' ? '#8a7d76' : '#a89c94';
      ctx.fillText(labelText, midX, midY);
      ctx.restore();
    }
  });

  // 2. Draw Nodes
  nodes.forEach(node => {
    const isNodeHovered = (node === hoveredNode);
    const isConnectedToHovered = hoveredNode && links.some(l => 
      (l.source === node && l.target === hoveredNode) || 
      (l.target === node && l.source === hoveredNode)
    );
    const isHighlighted = isNodeHovered || isConnectedToHovered || (node.id === activeFocusNodeId);

    // Apply slight dimming to disconnected nodes when hovering
    let opacity = 1;
    if (hoveredNode && !isNodeHovered && !isConnectedToHovered) {
      opacity = 0.45;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    // Node Style configuration
    let fillColor = '';
    let strokeColor = '';
    let lineWidth = 1.5;

    switch (node.type) {
      case 'root':
        fillColor = theme === 'light' ? '#b0693a' : 'var(--accent)';
        strokeColor = theme === 'light' ? '#8a4b22' : '#ffffff';
        lineWidth = 2.5;
        break;
      case 'resource':
        fillColor = theme === 'light' ? '#f6f1eb' : '#221813';
        strokeColor = theme === 'light' ? '#b0693a' : 'var(--accent)';
        lineWidth = 2;
        break;
      case 'creator':
        fillColor = theme === 'light' ? '#e3dcd3' : '#332822';
        strokeColor = theme === 'light' ? '#73635a' : '#a89c94';
        break;
      case 'category':
        fillColor = theme === 'light' ? '#d89b6c' : 'rgba(216, 155, 108, 0.2)';
        strokeColor = theme === 'light' ? '#b0693a' : 'var(--accent)';
        lineWidth = 2;
        break;
      case 'tag':
        fillColor = tagFillColor;
        strokeColor = tagStrokeColor;
        break;
    }

    // Dotted active ring around focused center node
    if (node.id === activeFocusNodeId) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = theme === 'light' ? '#b0693a' : 'var(--accent)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]); // reset
    }

    // Hover glowing halo
    if (isNodeHovered || isConnectedToHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = node.type === 'resource' || node.type === 'root' ? 'rgba(216, 155, 108, 0.15)' : 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
    }

    // Core Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isHighlighted ? 2.5 : lineWidth;
    ctx.fill();
    ctx.stroke();

    // Draw Labels
    ctx.font = isHighlighted ? 'bold 11px var(--font-sans)' : '10px var(--font-sans)';
    ctx.fillStyle = isHighlighted ? nodeTextActive : nodeTextMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Text background shadow
    ctx.shadowColor = theme === 'light' ? '#faf7f4' : '#120e0c';
    ctx.shadowBlur = 4;
    
    let labelText = node.label;
    if (labelText.length > 20) {
      labelText = labelText.substring(0, 18) + '...';
    }
    ctx.fillText(labelText, node.x, node.y + node.radius + 6);

    ctx.restore();
  });

  ctx.restore(); // Restore outer viewport transforms
}

// Event handlers
function onMouseDown(e) {
  if (currentView !== 'graph' || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const graphX = (x - panOffset.x) / zoomScale;
  const graphY = (y - panOffset.y) / zoomScale;

  draggedNode = findNodeAt(graphX, graphY);
  if (draggedNode) {
    dragStartX = graphX;
    dragStartY = graphY;
    startSimulation();
  } else {
    isPanning = true;
    panStartX = e.clientX - panOffset.x;
    panStartY = e.clientY - panOffset.y;
    canvas.style.cursor = 'grabbing';
    if (!isSimulating) {
      drawGraph();
    }
  }
}

function onMouseMove(e) {
  if (currentView !== 'graph' || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;

  const graphX = (mousePos.x - panOffset.x) / zoomScale;
  const graphY = (mousePos.y - panOffset.y) / zoomScale;

  if (draggedNode) {
    draggedNode.x = graphX;
    draggedNode.y = graphY;
    draggedNode.targetX = graphX;
    draggedNode.targetY = graphY;
    startSimulation();
  } else if (isPanning) {
    panOffset.x = e.clientX - panStartX;
    panOffset.y = e.clientY - panStartY;
    if (!isSimulating) {
      drawGraph();
    }
  } else {
    const oldHovered = hoveredNode;
    hoveredNode = findNodeAt(graphX, graphY);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    
    if (hoveredNode !== oldHovered && !isSimulating) {
      drawGraph();
    }
  }
}

function onMouseUp(e) {
  if (currentView !== 'graph' || !canvas) return;
  
  if (draggedNode) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const graphX = (x - panOffset.x) / zoomScale;
    const graphY = (y - panOffset.y) / zoomScale;

    const dragDistance = Math.sqrt((graphX - dragStartX) ** 2 + (graphY - dragStartY) ** 2);
    
    if (dragDistance < 6) {
      // Node Clicked!
      if (draggedNode.id === activeFocusNodeId) {
        // Clicked the center node
        if (draggedNode.type === 'resource') {
          openDetailsModal(draggedNode.refId);
        } else {
          // Go back up to root if it is category, tag, or creator
          const rootId = lastSearchTerm ? 'root_search' : 'root_hub';
          if (activeFocusNodeId !== rootId) {
            activeFocusNodeId = rootId;
            updateGraphData(lastFilteredResources);
          }
        }
      } else {
        // Clicked a neighbor node: focus it!
        activeFocusNodeId = draggedNode.id;
        updateGraphData(lastFilteredResources);
      }
    } else {
      // Re-trigger layout calculations so node slides back to its circular target slot
      updateGraphData(lastFilteredResources);
    }
    draggedNode = null;
  }

  if (isPanning) {
    isPanning = false;
    canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
    if (!isSimulating) {
      drawGraph();
    }
  }
}

function onMouseLeave() {
  if (draggedNode) {
    updateGraphData(lastFilteredResources);
    draggedNode = null;
  }
  isPanning = false;
  const oldHovered = hoveredNode;
  hoveredNode = null;
  if (oldHovered && !isSimulating) {
    drawGraph();
  }
}

function findNodeAt(gx, gy) {
  return nodes.find(node => {
    const dist = Math.sqrt((node.x - gx) ** 2 + (node.y - gy) ** 2);
    // Scale click bubble margin dynamically relative to the zoom scale
    return dist <= node.radius + (8 / zoomScale);
  });
}
