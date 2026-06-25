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
    featuredVideoId: "L9-2RntF79g", // Making a Kamachi small table
    languages: ["ja", "en"],
    tags: ["Furniture Making", "Sashimono", "Cabinetry", "ASMR", "Hand Tools", "Power Tools", "Wood Turning", "Workshop Life"],
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
    featuredVideoId: "3KqIIOyuo1Q", // The Art of Traditional Japanese Wood Joinery
    languages: ["ja", "en"],
    tags: ["Joinery & Carpentry", "Kigumi", "Timber Framing", "Restoration", "Hand Tools", "Kanna", "Nomi", "Nokogiri", "Traditional Architecture"],
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
    featuredVideoId: "PRN-Irvujs0", // Training video / student routine
    languages: ["ja"],
    tags: ["Miyadaiku", "Temple & Shrine Carpentry", "Apprenticeship", "Kigumi", "Hand Tools", "Traditional Architecture", "Sharpening", "Wood Prep"],
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
    featuredVideoId: "Y-_L-KmM_1s", // Traditional Craftsman Tool Making / Chiyotsuru Korehide
    languages: ["ja", "en"],
    tags: ["Museum & Archives", "Daiku Dougu", "Hand Tools", "Carpentry History", "Documentary", "Blacksmiths", "Tool Maintenance", "Edo Period"],
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
    featuredVideoId: "M39LOI4X3f4", // Bell Tower Construction
    languages: ["ja"],
    tags: ["Miyadaiku", "Temple & Shrine Carpentry", "Timber Framing", "Kigumi", "Traditional Architecture", "Heavy Timber", "Bell Towers", "Restoration"],
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
    featuredVideoId: "2FbUAkR0sac", // Sharpening tools / Japanese chisel
    languages: ["ja", "en"],
    tags: ["Woodworking School", "Hand Tools", "Sharpening", "Kanna", "Nomi", "Nokogiri", "Kigumi", "Joinery & Carpentry", "Wood Prep"],
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
    featuredVideoId: "E9R6DkAXbFY", // Shou Sugi Ban & timber joinery / Column repair
    languages: ["ja", "en"],
    tags: ["Shou Sugi Ban", "Eco-Construction", "Sumi-kiri", "Wood Prep", "Timber Framing", "Traditional Architecture", "Joinery & Carpentry", "Restoration"],
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
    featuredVideoId: "1BG6iTfjpoU", // Dining area renovation / House renovation
    languages: ["ja"],
    tags: ["Renovation", "Tool Setup", "Modern Carpentry", "Kanna", "Hand Tools", "Workshop Life", "Nokogiri", "Nomi"],
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
    tags: ["Hand Tools", "Daiku Dougu", "Blacksmiths", "Steel Quality", "Sharpening", "Kanna", "Nomi", "Tool Maintenance", "Carpentry History"],
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
    tags: ["Joinery & Carpentry", "Kigumi", "Joinery Theory", "Layout Math", "Shoji", "Traditional Architecture", "Japanese Gates", "Wood Mechanics"],
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
    tags: ["Museum & Archives", "Daiku Dougu", "Hand Tools", "Carpentry History", "Exhibitions", "Research", "Edo Period", "Blacksmiths"],
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
    tags: ["Daiku Dougu", "Hand Tools", "Kanna", "Nomi", "Nokogiri", "Blacksmiths", "Tool Maintenance", "Sharpening", "Guides"],
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
    tags: ["Kezuroukai", "Planing Competition", "Workshops", "Hand Tools", "Kanna", "Sharpening", "Woodworking School", "Events"],
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
    tags: ["Timber Framing", "Kigumi", "Shoji", "Tea Houses", "Traditional Architecture", "Joinery & Carpentry", "Japanese Gates"],
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
    tags: ["Boat Building", "Apprenticeship", "Historic Crafts", "Hand Tools", "Carpentry History", "Research", "Woodworking School"],
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
    tags: ["Sashigane", "Kikujutsu", "Layout Math", "Compound Angles", "Roof Layout", "Hand Tools", "Joinery & Carpentry"],
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
    tags: ["Sashigane", "Kikujutsu", "Layout Math", "Tool Anatomy", "Hand Tools", "Daiku Dougu", "Joinery & Carpentry"],
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
    tags: ["Daiku Dougu", "Hand Tools", "Kanna", "Nomi", "Nokogiri", "Blacksmiths", "Sharpening", "Carpentry History", "Philosophy"],
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
    tags: ["Kigumi", "Joinery & Carpentry", "Joinery Diagrams", "Blueprints", "Shiguchi", "Tsugite", "Hand Tools"],
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
    tags: ["Miyadaiku", "Temple & Shrine Carpentry", "Traditional Architecture", "Carpentry History", "Philosophy", "Timber Framing", "Kigumi"],
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
    tags: ["Daiku Dougu", "Hand Tools", "Kanna", "Nomi", "Nokogiri", "Blacksmiths", "Sharpening", "Carpentry History", "Museum & Archives"],
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
    tags: ["Kigumi", "Joinery & Carpentry", "Shiguchi", "Tsugite", "Timber Framing", "Joinery Diagrams", "Blueprints"],
    description: "คู่มือภาษาญี่ปุ่นคลาสสิกที่รวบรวมแผนผังการทำรอยต่อไม้แบบโบราณ ทั้งรอยต่อกลางไม้ (Tsugite) และรอยต่อชนมุม (Shiguchi) อธิบายทฤษฎีการกระจายน้ำหนักและการเข้าไม้แบบดั้งเดิม (The ultimate classic Japanese guide detailing traditional framing joints with structural diagrams).",
    popularity: "Classic Technical Book",
    region: "Japan"
  },
  {
    id: "book-hiroshi-uchida",
    title: "規矩術の基礎และ応用 (Kikujutsu: Foundations and Application)",
    author: "Hiroshi Uchida (内田 弘)",
    type: "book",
    category: "architecture",
    url: "https://www.amazon.co.jp/s?k=%E8%A6%8F%E7%9F%A9%E8%A1%93%E3%81%AE%E5%9F%BA%E7%A4%8E%E3%81%A8%E5%BF%9C%E7%94%A8",
    featuredVideoId: null,
    languages: ["ja"],
    tags: ["Kikujutsu", "Sashigane", "Layout Math", "Roof Layout", "Traditional Architecture", "Miyadaiku", "Compound Angles"],
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
    tags: ["Ukiyo-e", "Edo Period", "Art & Sketches", "Public Domain", "Lumberyard", "Nokogiri", "Hand Tools", "Carpentry History"],
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
    tags: ["Art & Sketches", "Public Domain", "Hand Tools", "Nomi", "Carpentry History", "Edo Period", "Daiku Dougu"],
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
    tags: ["Kikujutsu", "Miyadaiku", "Temple & Shrine Carpentry", "Traditional Architecture", "Blueprints", "Scroll Manual", "Edo Period", "Public Domain", "Kigumi"],
    description: "คัมภีร์ตำราเขียนแบบช่างไม้ดั้งเดิม 5 เล่ม รวบรวมในปี 1608 โดยตระกูลเฮโนอุจิ (ช่างใหญ่ของโชกุน) บันทึกสูตรลับการคำนวณสัดส่วนวิหารเจดีย์และวิธีการเข้าลิ่มไม้ (Kigumi) สำหรับสถาปัตยกรรมวัดญี่ปุ่นโบราณ (A famous 17th-century carpentry treatise detailing temple proportions and joinery formulas).",
    popularity: "Edo Period Master Manual (1608)",
    region: "Japan"
  }
];

// 2. State Management
let resources = [];
let bookmarks = [];
let activeTag = null;
let collections = [];
let activeCollectionId = null;
let stagedFiles = [];
let db = null;

// Compile and update JSON-LD Ontology script block in page head
function updateJSONLDOntology() {
  const context = {
    "@vocab": "https://schema.org/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "daiku": "https://noppadol.online/japanese-woodworking/ns#",
    "category": { "@id": "daiku:category", "@type": "@id" },
    "tag": { "@id": "daiku:tag", "@type": "@id" },
    "creator": { "@id": "schema:author", "@type": "@id" },
    "language": { "@id": "schema:inLanguage" }
  };

  const graph = [];

  // Add DefinedTermSet for Categories
  graph.push({
    "@type": "DefinedTermSet",
    "@id": "https://noppadol.online/japanese-woodworking/ontology#categories",
    "name": "Japanese Woodworking Categories"
  });

  // Add all active resources to the graph
  resources.forEach(res => {
    graph.push({
      "@type": res.type === "book" ? "Book" : "CreativeWork",
      "@id": `https://noppadol.online/japanese-woodworking/resource/${res.id}`,
      "name": res.title,
      "description": res.description,
      "url": res.url,
      "creator": {
        "@type": "Person",
        "name": res.author
      },
      "category": `https://noppadol.online/japanese-woodworking/category/${res.category}`,
      "inLanguage": res.languages,
      "keywords": res.tags
    });
  });

  const jsonld = {
    "@context": context,
    "@graph": graph
  };

  let scriptTag = document.getElementById('ontology-jsonld');
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = 'ontology-jsonld';
    scriptTag.type = 'application/ld+json';
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(jsonld, null, 2);
  console.log(`[Ontology] Updated JSON-LD: ${resources.length} nodes registered.`);
}

// Initialize State
async function initState() {
  // Init IndexedDB
  try {
    await initIndexedDB();
  } catch (e) {
    console.error("Failed to init IndexedDB:", e);
  }

  // Load bookmarks
  const storedBookmarks = localStorage.getItem('daiku_bookmarks');
  bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];

  // Load custom resources
  const storedCustom = localStorage.getItem('daiku_custom_resources');
  let customResources = storedCustom ? JSON.parse(storedCustom) : [];

  // Migrate/normalize old or redundant tags in custom resources
  customResources.forEach(res => {
    if (res.tags) {
      res.tags = res.tags.map(t => {
        const trimmed = t.trim();
        // Map redundant/outdated tags to clean standardized ones
        if (trimmed.toLowerCase() === 'japanese woodworking') {
          return 'Joinery & Carpentry';
        }
        if (trimmed.toLowerCase() === 'woodworking') {
          return 'Hand Tools';
        }
        return trimmed;
      });
      // De-duplicate tags
      res.tags = Array.from(new Set(res.tags));
    }
  });
  localStorage.setItem('daiku_custom_resources', JSON.stringify(customResources));

  // Combine initial and custom
  resources = [...initialResources, ...customResources];

  // Load custom collections
  const storedCollections = localStorage.getItem('daiku_collections');
  collections = storedCollections ? JSON.parse(storedCollections) : [
    { id: "col-1", name: "My Favorites", resourceIds: [] }
  ];

  // Render Collections list in sidebar
  renderCollections();

  // Populate checkboxes in Add Resource form
  updateCollectionCheckboxesInForm();

  // Update JSON-LD Ontology
  updateJSONLDOntology();

  // Set Theme based on browser local time (daytime: 6 AM - 6 PM -> light/bright, night -> dark)
  const hours = new Date().getHours();
  const isDaytime = hours >= 6 && hours < 18;
  const timeBasedTheme = isDaytime ? 'light' : 'dark';

  // Use sessionStorage to persist manual toggles for the current session
  const initialTheme = sessionStorage.getItem('daiku_theme') || timeBasedTheme;
  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeWidgetState(initialTheme);
}

// ==========================================
// IndexedDB & Document Attachment Manager
// ==========================================
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("WoodworkingDB", 1);
    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("IndexedDB initialized successfully");
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      if (!dbInstance.objectStoreNames.contains("attachments")) {
        dbInstance.createObjectStore("attachments", { keyPath: "id" });
      }
    };
  });
}

function saveAttachment(resourceId, file) {
  return new Promise((resolve, reject) => {
    if (!db) return reject("Database not initialized");
    const transaction = db.transaction(["attachments"], "readwrite");
    const store = transaction.objectStore("attachments");
    
    const entry = {
      id: `${resourceId}-${file.name}`,
      resourceId: resourceId,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file
    };
    
    const request = store.put(entry);
    request.onsuccess = () => resolve(entry);
    request.onerror = (e) => reject(e);
  });
}

function getAttachments(resourceId) {
  return new Promise((resolve, reject) => {
    if (!db) return resolve([]);
    const transaction = db.transaction(["attachments"], "readonly");
    const store = transaction.objectStore("attachments");
    const attachments = [];
    
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.resourceId === resourceId) {
          attachments.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(attachments);
      }
    };
    request.onerror = (e) => reject(e);
  });
}

function deleteAttachment(resourceId, filename) {
  return new Promise((resolve, reject) => {
    if (!db) return reject("Database not initialized");
    const transaction = db.transaction(["attachments"], "readwrite");
    const store = transaction.objectStore("attachments");
    const request = store.delete(`${resourceId}-${filename}`);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
}

// ==========================================
// Custom Collections Managers & Events
// ==========================================
function renderCollections() {
  const listContainer = document.getElementById('collection-list');
  if (!listContainer) return;
  
  listContainer.innerHTML = collections.map(col => {
    const isActive = activeCollectionId === col.id ? 'active' : '';
    return `
      <div class="collection-item ${isActive}" data-id="${col.id}">
        <span class="collection-name">${col.name}</span>
        <span class="collection-count">${col.resourceIds.length}</span>
        ${col.id !== 'col-1' ? `
          <button class="delete-collection-btn" title="Delete collection">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
  
  listContainer.querySelectorAll('.collection-item').forEach(item => {
    const colId = item.getAttribute('data-id');
    
    item.addEventListener('click', (e) => {
      if (e.target.closest('.delete-collection-btn')) return;
      
      if (activeCollectionId === colId) {
        activeCollectionId = null;
      } else {
        activeCollectionId = colId;
      }
      
      // Clear tag, category, and search input when selecting a collection
      activeTag = null;
      document.getElementById('filter-category').value = 'all';
      document.getElementById('search-input').value = '';
      
      renderCollections();
      renderDashboard();
    });
    
    const delBtn = item.querySelector('.delete-collection-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete the collection "${collections.find(c => c.id === colId).name}"?`)) {
          collections = collections.filter(c => c.id !== colId);
          localStorage.setItem('daiku_collections', JSON.stringify(collections));
          if (activeCollectionId === colId) activeCollectionId = null;
          renderCollections();
          renderDashboard();
          updateCollectionCheckboxesInForm();
        }
      });
    }
  });
}

function setupCollectionsActions() {
  const addColBtn = document.getElementById('add-collection-btn');
  if (addColBtn) {
    addColBtn.addEventListener('click', () => {
      const name = prompt("Enter new collection name:");
      if (name && name.trim()) {
        const newCol = {
          id: "col-" + Date.now(),
          name: name.trim(),
          resourceIds: []
        };
        collections.push(newCol);
        localStorage.setItem('daiku_collections', JSON.stringify(collections));
        renderCollections();
        updateCollectionCheckboxesInForm();
      }
    });
  }
}

function updateCollectionCheckboxesInForm() {
  const container = document.getElementById('form-collections-checkboxes');
  if (!container) return;
  
  if (collections.length === 0) {
    container.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">No custom collections created yet.</span>';
    return;
  }
  
  container.innerHTML = collections.map(col => `
    <label class="checkbox-label" style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
      <input type="checkbox" name="form-collections" value="${col.id}"> ${col.name}
    </label>
  `).join('');
}

// ==========================================
// File Attachment Staging & Upload Events
// ==========================================
function setupAttachmentsStaging() {
  const fileInput = document.getElementById('form-attachments');
  const listContainer = document.getElementById('staged-attachments-list');
  if (!fileInput || !listContainer) return;
  
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    files.forEach(file => {
      if (!stagedFiles.some(f => f.name === file.name)) {
        stagedFiles.push(file);
      }
    });
    renderStagedFiles();
    fileInput.value = '';
  });
  
  function renderStagedFiles() {
    listContainer.innerHTML = stagedFiles.map((file, index) => `
      <span class="attachment-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        ${file.name} (${(file.size / 1024).toFixed(1)} KB)
        <button type="button" class="remove-btn" data-index="${index}" style="margin-left: 0.3rem; border: none; background: none; cursor: pointer; color: var(--text-muted);">✕</button>
      </span>
    `).join('');
    
    listContainer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        stagedFiles.splice(index, 1);
        renderStagedFiles();
      });
    });
  }
}

// ==========================================
// YouTube URL Metadata oEmbed Auto-Fetch
// ==========================================
function setupUrlAutoFetch() {
  const urlInput = document.getElementById('form-url');
  if (!urlInput) return;
  
  urlInput.addEventListener('input', async () => {
    const url = urlInput.value.trim();
    if (!url) return;
    
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(ytRegex);
    
    if (match) {
      const videoId = match[1];
      const vidField = document.getElementById('form-youtube-id');
      if (vidField && !vidField.value) {
        vidField.value = videoId;
      }
      
      const typeField = document.getElementById('form-type');
      if (typeField) {
        typeField.value = 'youtube';
      }
      
      try {
        let label = document.getElementById('youtube-fetch-badge');
        if (!label) {
          label = document.createElement('span');
          label.id = 'youtube-fetch-badge';
          label.style.fontSize = '0.75rem';
          label.style.color = 'var(--accent)';
          label.style.marginLeft = '0.5rem';
          const urlLabel = urlInput.previousElementSibling;
          if (urlLabel) urlLabel.appendChild(label);
        }
        
        label.textContent = '⏳ Loading YouTube info...';
        label.style.color = 'var(--accent)';
        
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (response.ok) {
          const data = await response.json();
          
          const titleField = document.getElementById('form-title');
          if (titleField && !titleField.value) {
            titleField.value = data.title;
          }
          
          const authorField = document.getElementById('form-author');
          if (authorField && !authorField.value) {
            authorField.value = data.author_name;
          }
          
          label.textContent = '✓ YouTube info loaded!';
          label.style.color = '#4caf50';
          setTimeout(() => {
            const lbl = document.getElementById('youtube-fetch-badge');
            if (lbl) lbl.remove();
          }, 3000);
        } else {
          label.remove();
        }
      } catch (err) {
        console.error("Error fetching oEmbed:", err);
        const label = document.getElementById('youtube-fetch-badge');
        if (label) label.remove();
      }
    }
  });
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

// Helper functions for spelling suggestions/fuzzy matching
function levenshteinDistance(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // Deletion
        matrix[i][j - 1] + 1,       // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  return matrix[len1][len2];
}

function getStringSimilarity(s1, s2) {
  const dist = levenshteinDistance(s1.toLowerCase(), s2.toLowerCase());
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - (dist / maxLen);
}

function getSpellingSuggestions(query) {
  if (!query || query.trim().length < 2) return [];
  const cleanQuery = query.trim().toLowerCase();
  
  // Extract candidates from resources dataset
  const candidates = new Set();
  
  resources.forEach(res => {
    // Add author name
    candidates.add(res.author);
    // Add individual author name parts
    res.author.split(/\s+/).forEach(part => {
      const p = part.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
      if (p.length > 2) candidates.add(p);
    });
    
    // Add tags
    res.tags.forEach(tag => candidates.add(tag));
    
    // Add title
    candidates.add(res.title);
    // Add words in title
    res.title.split(/\s+/).forEach(part => {
      const cleanPart = part.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
      if (cleanPart.length > 2) candidates.add(cleanPart);
    });
  });

  const uniqueCandidates = Array.from(candidates).filter(c => c && c.trim().length > 1);
  
  // Try to match the whole query
  const ranked = uniqueCandidates.map(c => {
    const similarity = getStringSimilarity(cleanQuery, c);
    return { term: c, similarity };
  });

  // Filter candidates
  let results = ranked
    .filter(item => item.similarity >= 0.68 && item.similarity < 0.99)
    .sort((a, b) => b.similarity - a.similarity)
    .map(item => item.term);

  // If we have no results, try splitting the query and guessing for the longest/most significant words
  if (results.length === 0 && cleanQuery.includes(' ')) {
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      const wordSuggestions = [];
      words.forEach(word => {
        const wordRanked = uniqueCandidates.map(c => {
          const similarity = getStringSimilarity(word, c);
          return { term: c, similarity };
        });
        const wordMatches = wordRanked
          .filter(item => item.similarity >= 0.7 && item.similarity < 0.99)
          .sort((a, b) => b.similarity - a.similarity)
          .map(item => item.term);
        wordSuggestions.push(...wordMatches);
      });
      results = Array.from(new Set(wordSuggestions));
    }
  }

  // Deduplicate case-insensitively
  const finalSuggestions = [];
  const lowerSeen = new Set();
  for (const r of results) {
    const l = r.toLowerCase();
    if (!lowerSeen.has(l)) {
      lowerSeen.add(l);
      finalSuggestions.push(r);
    }
    if (finalSuggestions.length >= 4) break;
  }

  return finalSuggestions;
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

    // Custom Collection match
    const matchesCollection = !activeCollectionId || 
      collections.find(c => c.id === activeCollectionId)?.resourceIds.includes(res.id);

    return matchesSearch && matchesCategory && matchesLanguage && matchesType && matchesFavorite && matchesActiveTag && matchesCollection;
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

  // Update Graph View data
  updateGraphData(filtered);

  // Render Grid Content
  if (filtered.length === 0) {
    const searchInputVal = document.getElementById('search-input').value.trim();
    const suggestions = getSpellingSuggestions(searchInputVal);

    let suggestionsHtml = '';
    if (suggestions.length > 0) {
      suggestionsHtml = `
        <div class="spelling-suggestions" style="margin-top: 1.5rem; padding: 1rem; background: var(--panel-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); text-align: center; box-shadow: 0 4px 10px var(--shadow-color);">
          <p style="margin: 0 0 0.8rem 0; font-size: 0.85rem; color: var(--text-muted); font-weight: 500; letter-spacing: 0.5px;">Did you mean / คำใกล้เคียงที่คุณอาจหมายถึง:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: center;">
            ${suggestions.map(s => `
              <button class="btn btn-sm spelling-suggestion-btn" data-suggestion="${s.replace(/"/g, '&quot;')}">
                ${s}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    grid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No Woodworking Resources Found</h3>
        <p>Try adjusting your search criteria, clearing the filters, or disabling "Bookmarks Only".</p>
        ${suggestionsHtml}
      </div>
    `;

    // Add click listeners to suggestion buttons
    grid.querySelectorAll('.spelling-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-suggestion');
        const input = document.getElementById('search-input');
        input.value = val;
        // Trigger render
        renderDashboard();
      });
    });
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

    const isCustom = !initialResources.some(ir => ir.id === res.id);
    const deleteButtonHtml = isCustom ? `
      <button class="delete-resource-btn" data-id="${res.id}" aria-label="Delete resource" style="background: none; border: none; color: #ff6b6b; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center; margin-right: 0.8rem;" title="Delete this resource">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
      </button>
    ` : '';

    return `
      <article class="resource-card" data-id="${res.id}">
        <div class="card-header">
          <span class="type-badge ${res.type}">${typeLabel}</span>
          <div style="display: flex; align-items: center;">
            ${deleteButtonHtml}
            <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${res.id}" aria-label="Bookmark ${res.title}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
          </div>
        </div>
        <h3 class="card-title">${res.title}</h3>
        <div class="card-author">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          ${res.author}
        </div>
        <p class="card-desc">${res.description}</p>
        <div class="card-tags">${miniTags}</div>
        
        <div class="card-collection-actions" style="margin-bottom: 0.8rem;">
          <select class="collection-select-btn form-control" data-id="${res.id}" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; height: auto; cursor: pointer; width: 100%;">
            <option value="">📂 Add to Collection...</option>
            ${collections.map(c => {
              const inCol = c.resourceIds.includes(res.id);
              return `<option value="${c.id}" ${inCol ? 'disabled style="color:var(--text-muted);"' : ''}>${inCol ? '✓ ' : '+ '}${c.name}</option>`;
            }).join('')}
          </select>
        </div>

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

  // Wire up Delete Custom Resource click events
  document.querySelectorAll('.delete-resource-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const resId = btn.getAttribute('data-id');
      const resTitle = resources.find(r => r.id === resId)?.title || "this resource";
      
      if (confirm(`Are you sure you want to delete "${resTitle}"? This will remove all its collections associations and attachments.`)) {
        // 1. Remove from custom resources storage
        const storedCustom = localStorage.getItem('daiku_custom_resources');
        let customRes = storedCustom ? JSON.parse(storedCustom) : [];
        customRes = customRes.filter(r => r.id !== resId);
        localStorage.setItem('daiku_custom_resources', JSON.stringify(customRes));

        // 2. Remove from bookmarks
        bookmarks = bookmarks.filter(id => id !== resId);
        localStorage.setItem('daiku_bookmarks', JSON.stringify(bookmarks));

        // 3. Remove from collections
        collections.forEach(c => {
          c.resourceIds = c.resourceIds.filter(id => id !== resId);
        });
        localStorage.setItem('daiku_collections', JSON.stringify(collections));

        // 4. Update the active resources array in memory
        resources = [...initialResources, ...customRes];

        // 5. Trigger complete redraw
        renderCollections();
        renderTagCloud();
        renderDashboard();
      }
    });
  });

  // Wire up Collection Selector inside cards
  document.querySelectorAll('.collection-select-btn').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const resId = sel.getAttribute('data-id');
      const colId = e.target.value;
      if (!colId) return;
      
      const col = collections.find(c => c.id === colId);
      if (col && !col.resourceIds.includes(resId)) {
        col.resourceIds.push(resId);
        localStorage.setItem('daiku_collections', JSON.stringify(collections));
        renderCollections();
        renderDashboard();
      }
      e.target.value = ""; // Reset dropdown
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

  // Render Attachments from IndexedDB
  const attachmentsList = document.getElementById('details-attachments-list');
  if (attachmentsList) {
    attachmentsList.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">Loading attachments...</span>';
    getAttachments(res.id).then(files => {
      if (files.length === 0) {
        attachmentsList.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No documents attached.</span>';
        return;
      }
      attachmentsList.innerHTML = files.map(file => {
        const fileUrl = URL.createObjectURL(file.blob);
        return `
          <div style="display: flex; align-items: center; gap: 0.4rem; background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.2rem 0.5rem;">
            <a href="${fileUrl}" target="_blank" class="attachment-badge" style="border: none; background: none; padding: 0; display: inline-flex; align-items: center; gap: 0.3rem;" title="Open ${file.name}">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              ${file.name} (${(file.size / 1024).toFixed(1)} KB)
            </a>
            <button class="delete-attachment-btn" data-res-id="${res.id}" data-filename="${file.name}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.1rem; display: flex; align-items: center;" title="Delete document">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;
      }).join('');
      
      // Delete attachment handler
      attachmentsList.querySelectorAll('.delete-attachment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const rId = btn.getAttribute('data-res-id');
          const filename = btn.getAttribute('data-filename');
          if (confirm(`Delete attached file "${filename}"?`)) {
            await deleteAttachment(rId, filename);
            openDetailsModal(rId);
          }
        });
      });
    }).catch(err => {
      console.error(err);
      attachmentsList.innerHTML = '<span style="font-size: 0.85rem; color: #ff6b6b;">Error loading attachments.</span>';
    });
  }

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

// 8. Theme Toggle logic (Traditional Wood Joint Widget)
function setupThemeToggler() {
  const jointWidget = document.getElementById('joint-widget');
  if (!jointWidget) return;

  jointWidget.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    sessionStorage.setItem('daiku_theme', newTheme);
    updateThemeWidgetState(newTheme);
    
    // Redraw graph to update its colors for the new theme
    if (typeof drawGraph === 'function') {
      drawGraph();
    }
  });
}

function updateThemeWidgetState(theme) {
  const jointSvg = document.getElementById('joint-svg');
  const themeStatus = document.getElementById('theme-status');
  if (!jointSvg || !themeStatus) return;

  if (theme === 'light') {
    jointSvg.classList.add('unlocked');
    themeStatus.textContent = 'Bright';
    themeStatus.style.color = 'var(--accent-hover)';
  } else {
    jointSvg.classList.remove('unlocked');
    themeStatus.textContent = 'Dark';
    themeStatus.style.color = '';
  }
}

// 10. Form Submission (Add Custom Resource)
function setupFormSubmission() {
  const form = document.getElementById('add-resource-form');
  const modal = document.getElementById('add-resource-modal');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newUrl = document.getElementById('form-url').value.trim();
    const newVideoId = document.getElementById('form-youtube-id').value.trim();

    // Clean URL comparison helper
    const cleanUrl = (u) => {
      try {
        const p = new URL(u);
        let c = p.hostname.replace('www.', '') + p.pathname.replace(/\/$/, '');
        if (p.hostname.includes('youtube.com') || p.hostname.includes('youtu.be')) {
          const v = p.searchParams.get('v');
          if (v) c += `?v=${v}`;
        }
        return c.toLowerCase();
      } catch (err) {
        return u.replace(/\/$/, '').toLowerCase();
      }
    };

    // Find duplicates
    const duplicateByUrl = resources.find(r => r.url && cleanUrl(r.url) === cleanUrl(newUrl));
    const duplicateByVideo = newVideoId ? resources.find(r => r.featuredVideoId === newVideoId) : null;
    const duplicate = duplicateByUrl || duplicateByVideo;

    if (duplicate) {
      if (confirm(`This resource already exists in your hub:\n"${duplicate.title}" by ${duplicate.author}\n\nWould you like to open it instead?`)) {
        modal.close();
        form.reset();
        stagedFiles = [];
        const stagedList = document.getElementById('staged-attachments-list');
        if (stagedList) stagedList.innerHTML = '';
        
        // Open details and focus
        openDetailsModal(duplicate.id);
        activeFocusNodeId = `res_${duplicate.id}`;
        renderDashboard();
      }
      return;
    }

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

    // Process selected Collections
    const selectedColCheckboxes = document.querySelectorAll('input[name="form-collections"]:checked');
    const selectedColIds = Array.from(selectedColCheckboxes).map(cb => cb.value);
    selectedColIds.forEach(colId => {
      const col = collections.find(c => c.id === colId);
      if (col && !col.resourceIds.includes(newResource.id)) {
        col.resourceIds.push(newResource.id);
      }
    });
    if (selectedColIds.length > 0) {
      localStorage.setItem('daiku_collections', JSON.stringify(collections));
      renderCollections();
    }

    // Process staged File Attachments
    if (stagedFiles.length > 0) {
      Promise.all(stagedFiles.map(file => saveAttachment(newResource.id, file)))
        .then(() => {
          console.log(`[IndexedDB] Staged attachments saved for ${newResource.id}`);
          stagedFiles = [];
          const stagedList = document.getElementById('staged-attachments-list');
          if (stagedList) stagedList.innerHTML = '';
        })
        .catch(err => console.error("Error saving staged attachments:", err));
    }

    // Update state and refresh
    resources.push(newResource);
    
    // Clear filters and focus on the newly added resource node to highlight it
    resetDashboardFilters();
    activeFocusNodeId = `res_${newResource.id}`;
    
    // Regenerate ontology metadata and redraw views
    updateJSONLDOntology();
    renderDashboard();
    renderTagCloud();

    // Reset Form & Close Modal
    form.reset();
    stagedFiles = []; // Reset staged files array on close/cancel
    const stagedList = document.getElementById('staged-attachments-list');
    if (stagedList) stagedList.innerHTML = '';
    
    // Refresh collection checkboxes in form
    updateCollectionCheckboxesInForm();
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
  setupCollectionsActions();
  setupAttachmentsStaging();
  setupUrlAutoFetch();

  // Initialize Graph View on Page Load
  initGraphView();
  resizeCanvas();

  // Initial Renders
  renderDashboard();
  renderTagCloud();
});

// ==========================================
// 12. Interactive Canvas Graph View Engine
// ==========================================

// Graph view state variables
let currentView = 'graph';
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

function initGraphView() {
  canvas = document.getElementById('graph-canvas');
  ctx = canvas.getContext('2d');
  graphContainer = document.getElementById('graph-view-container');

  window.addEventListener('resize', () => {
    resizeCanvas();
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

function resetDashboardFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('filter-category').value = 'all';
  document.getElementById('filter-language').value = 'all';
  document.getElementById('filter-type').value = 'all';
  document.getElementById('favorites-toggle').classList.remove('active');
  activeTag = null;
  renderTagCloud();
}

function setupControlsPanel() {
  const panel = document.getElementById('graph-controls-panel');
  const toggle = document.getElementById('controls-toggle');
  
  // Collapse/Expand toggle
  toggle.addEventListener('click', () => {
    panel.classList.toggle('collapsed');
  });

  // Reset Focus button (resets focus node and clears dashboard filters)
  const resetFocusBtn = document.getElementById('btn-reset-focus');
  if (resetFocusBtn) {
    resetFocusBtn.addEventListener('click', () => {
      activeFocusNodeId = 'root_hub';
      resetDashboardFilters();
      renderDashboard();
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

  // Build ontology database using only the currently active filtered resources
  const { allNodes, allLinks } = getOntologyDatabase(searchInputVal, filteredResources);

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

function getOntologyDatabase(searchTerm, activeResources) {
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
  const currentResources = activeResources || resources;
  currentResources.forEach(res => {
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

    // Link resource to its type
    const typeId = `type_${res.type}`;
    if (!allNodes.has(typeId)) {
      allNodes.set(typeId, {
        id: typeId,
        label: res.type.charAt(0).toUpperCase() + res.type.slice(1),
        type: 'type',
        radius: 13,
        typeName: res.type
      });
    }
    allLinks.push({ sourceId: resId, targetId: typeId, relation: 'hasType' });

    // Link resource to its languages
    res.languages.forEach(lang => {
      const langId = `lang_${lang}`;
      if (!allNodes.has(langId)) {
        allNodes.set(langId, {
          id: langId,
          label: lang.toUpperCase(),
          type: 'language',
          radius: 12,
          langCode: lang
        });
      }
      allLinks.push({ sourceId: resId, targetId: langId, relation: 'availableIn' });
    });

    // Link resource to its region
    if (res.region) {
      const regionId = `region_${res.region}`;
      if (!allNodes.has(regionId)) {
        allNodes.set(regionId, {
          id: regionId,
          label: res.region,
          type: 'region',
          radius: 12,
          regionName: res.region
        });
      }
      allLinks.push({ sourceId: resId, targetId: regionId, relation: 'originatesIn' });
    }

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
  const nodeTextMuted = theme === 'light' ? '#73635a' : '#a89c94';
  const nodeTextActive = theme === 'light' ? '#2b1f1a' : '#f5efe9';
  const tagFillColor = theme === 'light' ? 'rgba(109, 162, 248, 0.15)' : 'rgba(109, 162, 248, 0.1)';
  const tagStrokeColor = '#6da2f8';

  // 1. Draw Links (Edges) with Directional Arrowheads and Relationship Label Pills (stably)
  links.forEach(link => {
    const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
    
    // Calculate start and end coordinates on the circle boundaries of the nodes
    const startX = link.source.x + Math.cos(angle) * link.source.radius;
    const startY = link.source.y + Math.sin(angle) * link.source.radius;
    // Add extra offset so arrow tip points precisely to node boundary stroke
    const endOffset = link.target.radius + 5;
    const endX = link.target.x - Math.cos(angle) * endOffset;
    const endY = link.target.y - Math.sin(angle) * endOffset;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = linkColorNormal;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Draw Arrowhead at the target edge
    ctx.save();
    ctx.translate(endX, endY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-5, -2.5);
    ctx.lineTo(-5, 2.5);
    ctx.closePath();
    ctx.fillStyle = linkColorNormal;
    ctx.fill();
    ctx.restore();

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
    const isHighlighted = (node.id === activeFocusNodeId);

    ctx.save();
    ctx.globalAlpha = 1.0; // Keep all nodes fully visible, no dimming on hover!

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
      case 'type':
        fillColor = theme === 'light' ? '#ebf3e6' : '#22301c';
        strokeColor = '#7cb342';
        break;
      case 'language':
        fillColor = theme === 'light' ? '#e3f2fd' : '#152b3c';
        strokeColor = '#6da2f8';
        break;
      case 'region':
        fillColor = theme === 'light' ? '#fbe9e7' : '#3c1f15';
        strokeColor = '#ff7043';
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

    // Hover glowing halo (only on the hovered node itself!)
    if (isNodeHovered) {
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

    // Draw Node Icon (Emoji) in the center of the node
    let emoji = '';
    switch (node.type) {
      case 'root':
        emoji = node.id === 'root_search' ? '🔍' : '🏠';
        break;
      case 'category':
        emoji = '📁';
        break;
      case 'resource':
        const rType = node.resourceData?.type;
        if (rType === 'youtube') emoji = '📺';
        else if (rType === 'book') emoji = '📖';
        else if (rType === 'blog') emoji = '✍️';
        else if (rType === 'museum') emoji = '🏛️';
        else if (rType === 'archive') emoji = '🎨';
        else emoji = '🌐';
        break;
      case 'creator':
        emoji = '👤';
        break;
      case 'tag':
        emoji = '🏷️';
        break;
      case 'type':
        emoji = '⚙️';
        break;
      case 'language':
        const code = node.langCode?.toLowerCase();
        if (code === 'ja') emoji = '🇯🇵';
        else if (code === 'en') emoji = '🇺🇸';
        else if (code === 'th') emoji = '🇹🇭';
        else emoji = '🌐';
        break;
      case 'region':
        emoji = '📍';
        break;
    }

    if (emoji) {
      ctx.save();
      ctx.font = `${node.radius * 0.95}px var(--font-sans)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0; // Disable text shadow for clean icon rendering
      ctx.fillText(emoji, node.x, node.y + 1); // Centered with a slight y offset
      ctx.restore();
    }

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
          // Go back up to root and reset filters
          const rootId = lastSearchTerm ? 'root_search' : 'root_hub';
          if (activeFocusNodeId !== rootId) {
            activeFocusNodeId = rootId;
            resetDashboardFilters();
            renderDashboard();
          }
        }
      } else {
        // Clicked a neighbor node: focus it!
        activeFocusNodeId = draggedNode.id;

        // Apply interactive filtering to cards
        if (draggedNode.type === 'category') {
          document.getElementById('filter-category').value = draggedNode.categoryKey;
        } else if (draggedNode.type === 'tag') {
          activeTag = draggedNode.tagName;
          renderTagCloud();
        } else if (draggedNode.type === 'creator') {
          document.getElementById('search-input').value = draggedNode.creatorName;
        } else if (draggedNode.type === 'type') {
          const normType = draggedNode.typeName.toLowerCase();
          const typeSelect = document.getElementById('filter-type');
          if (Array.from(typeSelect.options).some(opt => opt.value === normType)) {
            typeSelect.value = normType;
          }
        } else if (draggedNode.type === 'language') {
          const langSelect = document.getElementById('filter-language');
          if (Array.from(langSelect.options).some(opt => opt.value === draggedNode.langCode)) {
            langSelect.value = draggedNode.langCode;
          }
        } else if (draggedNode.type === 'region') {
          document.getElementById('search-input').value = draggedNode.regionName;
        }

        renderDashboard();
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
