// app.js
// Local-first persistent Gokarna Road Trip live-logger & planner

// Default dataset configurations
const DEFAULT_ITINERARY = [
  {
    dayNum: 1,
    title: "Road Trip: Pune to Gokarna",
    dateText: "May 30, Friday &bull; Distance: 504 km",
    badges: ["Kolhapuri Mutton", "Cliffside Check-in", "Kudle Sunset"],
    milestones: [
      { id: "m1_1", time: "04:00 AM", title: "Roll Out from Pune", desc: "Meet up at Chandani Chowk / Katraj Bypass. Pack the bags into Abhishek's SUV. Hit the road early to beat the Satara highway traffic.", tag: "Roadtrip", expense: 4500 },
      { id: "m1_2", time: "07:30 AM", title: "Kolhapur Breakfast Stop", desc: "Stop near Kolhapur bypass for piping hot Misal Pav and filter coffee at a local highway dhaba.", tag: "Food", expense: 800 },
      { id: "m1_3", time: "01:00 PM", title: "Ghat Road & Entry into Karnataka", desc: "Drive via Hubballi / Yellapur road. Drive through lush Western Ghats forests. Stop for a quick tea break.", tag: "Scenic Drive", expense: 0 },
      { id: "m1_4", time: "03:30 PM", title: "Check-in & Unwind", desc: "Arrive in Gokarna. Check into our rooms (Zostel Gokarna on the cliff or beach resort). Freshen up, have chilled beers, and listen to the waves.", tag: "Hotel", expense: 8000 },
      { id: "m1_5", time: "05:30 PM", title: "Kudle Beach Sunset & Shack Dinner", desc: "Walk down from the cliff to Kudle Beach. Watch a beautiful sunset, chill at shacks (Namaste Cafe / Sunset Cafe), listen to acoustic jams, and feast on seafood.", tag: "Beach Vibe", expense: 3200 }
    ]
  },
  {
    dayNum: 2,
    title: "The Five-Beach Cliff Trek",
    dateText: "May 31, Saturday &bull; Trek details: Moderate hike along cliffs",
    badges: ["Paradise Beach", "Half Moon Beach", "Om Beach Cafe"],
    milestones: [
      { id: "m2_1", time: "08:00 AM", title: "Hearty Breakfast", desc: "Order Nutella pancakes, cheese omelette, and iced tea at the hostel cafe.", tag: "Food", expense: 1200 },
      { id: "m2_2", time: "09:30 AM", title: "Start Beach Trek (Belekan to Paradise)", desc: "Drive to Belekan Beach. Start the classic rocky cliff trek. Walk through forest paths and emerge onto Paradise Beach (fully raw, isolated beach, perfect for swimming).", tag: "Adventure Trek", expense: 400 },
      { id: "m2_3", time: "12:30 PM", title: "Half Moon Beach Pitstop", desc: "Trek from Paradise to Half Moon Beach. Sip on fresh coconut water and chill on hammocks.", tag: "Beach Vibe", expense: 600 },
      { id: "m2_4", time: "02:30 PM", title: "Late Lunch at Om Beach (Namaste Cafe)", desc: "Complete the trek at Om Beach. Grab a sea-facing table at the legendary Namaste Cafe. Order pizzas, seafood platters, and cold beverages.", tag: "Food & Chill", expense: 3500 },
      { id: "m2_5", time: "08:00 PM", title: "Night Beach Bonfire & Stargazing", desc: "Set up a small bonfire on a quiet corner of the beach, play acoustic tunes, share horror stories, and watch the clear starry sky.", tag: "Nightlife", expense: 500 }
    ]
  },
  {
    dayNum: 3,
    title: "Water Sports & Vibhuti Waterfalls",
    dateText: "June 1, Sunday &bull; Road trip to forest waterfalls",
    badges: ["Banana Ride", "Vibhuti Falls dip", "Yana Caves Trek"],
    milestones: [
      { id: "m3_1", time: "09:00 AM", title: "Om Beach Water Sports", desc: "Head to Om Beach for water activities: Jet Ski rides, Banana Boat rides, and Speedboat rounds. Get soaked!", tag: "Water Sports", expense: 4200 },
      { id: "m3_2", time: "11:30 AM", title: "Drive to Vibhuti Waterfalls", desc: "Take the scenic forest road towards Sirsi (approx. 1.5 hours drive). Keep snacks ready.", tag: "Roadtrip", expense: 1500 },
      { id: "m3_3", time: "01:00 PM", title: "Cool Dip at Vibhuti Falls", desc: "A short jungle walk leads to the pristine Vibhuti waterfalls. Take a refreshing, cold dip in the natural pool under the waterfall cascade.", tag: "Nature Pool", expense: 200 },
      { id: "m3_4", time: "03:30 PM", title: "Explore Yana Caves", desc: "Drive 15 mins to Yana. Hike up to the giant, black crystalline limestone monolith rock formations. Enter the cave pass and check out the bats and geological structures.", tag: "Trek / Cave", expense: 300 },
      { id: "m3_5", time: "08:00 PM", title: "Last Night Feast & Beers", desc: "Return to Gokarna. Dine at a top cafe (Chez Christophe or Prema Restaurant). Pack bags and get ready for the return journey.", tag: "Dinner Party", expense: 3800 }
    ]
  },
  {
    dayNum: 4,
    title: "Temple Sunrise & Drive Back to Pune",
    dateText: "June 2, Monday &bull; Distance: 504 km",
    badges: ["Koti Teertha", "Mahabaleshwar Temple", "Kolhapuri Thali"],
    milestones: [
      { id: "m4_1", time: "07:00 AM", title: "Koti Teertha & Mahabaleshwar Temple", desc: "Quick walk around the sacred Koti Teertha pond. Visit the famous Mahabaleshwar Temple (housing the Atmalinga). Note: Dress code applies inside the temple premises.", tag: "Heritage", expense: 0 },
      { id: "m4_2", time: "09:00 AM", title: "Checkout & Start Journey", desc: "Heavy breakfast at hotel. Checkout and load the trunk. Wave goodbye to the Gokarna coastline and start driving towards Pune.", tag: "Roadtrip", expense: 600 },
      { id: "m4_3", time: "02:30 PM", title: "Lunch stop near Belagavi", desc: "Stop for traditional North Karnataka meals (Jolada Roti, curry, curd) along the highway.", tag: "Food", expense: 1000 },
      { id: "m4_4", time: "07:30 PM", title: "Grand Dinner Stop: Kolhapuri Mutton/Veg Thali", desc: "Enter Kolhapur. Stop at a top local spot (like Hotel Dehati or Opal) for the legendary Kolhapuri Mutton Thali, Tambda Rassa, and Pandhra Rassa. Authentic veg options are also awesome.", tag: "Feast Stop", expense: 2400 },
      { id: "m4_5", time: "11:00 PM", title: "Arrive in Pune", desc: "Cross Katraj tunnel, drop everyone home. Trip ends with memory cards full and empty wallets!", tag: "Home sweet home", expense: 0 }
    ]
  }
];

const DEFAULT_CHECKLIST = [
  { id: "c1", text: "Swimwear / Board shorts", category: "Beachwear", checked: false },
  { id: "c2", text: "Sunscreen SPF 50", category: "Essentials", checked: true },
  { id: "c3", text: "Bluetooth Speaker (JBL/Bose)", category: "Entertainment", checked: false },
  { id: "c4", text: "First Aid Kit & ORS packets", category: "Essentials", checked: true },
  { id: "c5", text: "Driving License & Car papers", category: "Road Trip", checked: true },
  { id: "c6", text: "Snacks for the 8hr road trip", category: "Road Trip", checked: false },
  { id: "c7", text: "Powerbanks & Charging cords", category: "Essentials", checked: false },
  { id: "c8", text: "Beach volleyball / Frisbee", category: "Entertainment", checked: false }
];

// App Memory States
let itinerary = [];
let checklist = [];
let activeCategoryFilter = "All";
const expandedDays = new Set([1]); // Day 1 expanded by default
// Firestore sync helpers
let lastLocalUpdate = 0;
let fbDocRef = null;

// 1. Data Store Drivers
function loadData() {
  const storedItinerary = localStorage.getItem("gokarna_itinerary_data");
  if (storedItinerary) {
    itinerary = JSON.parse(storedItinerary);
  } else {
    itinerary = [...DEFAULT_ITINERARY];
    // persist initial default locally; cloud sync will pick this up if enabled
    saveItinerary();
  }

  const storedChecklist = localStorage.getItem("gokarna_checklist_data");
  if (storedChecklist) {
    checklist = JSON.parse(storedChecklist);
  } else {
    checklist = [...DEFAULT_CHECKLIST];
    saveChecklist();
  }
}

async function saveItinerary() {
  // persist locally first
  try {
    localStorage.setItem("gokarna_itinerary_data", JSON.stringify(itinerary));
  } catch (e) {
    console.warn('localStorage unavailable for itinerary', e);
  }

  // attempt cloud sync if Firebase is initialized
  const updatedAt = Date.now();
  lastLocalUpdate = updatedAt;
  try {
    if (window._FB && window._FB.db && window._FB.setDoc && window._FB.doc) {
      const ref = window._FB.doc(window._FB.db, "trips", "gokarna");
      fbDocRef = ref;
      await window._FB.setDoc(ref, { itinerary, checklist, updatedAt }, { merge: true });
    }
  } catch (err) {
    console.warn('Failed to save itinerary to Firestore, falling back to localStorage', err);
  }

  renderItinerary();
  updateTotalExpenseStat();
}

async function saveChecklist() {
  try {
    localStorage.setItem("gokarna_checklist_data", JSON.stringify(checklist));
  } catch (e) {
    console.warn('localStorage unavailable for checklist', e);
  }

  const updatedAt = Date.now();
  lastLocalUpdate = updatedAt;
  try {
    if (window._FB && window._FB.db && window._FB.setDoc && window._FB.doc) {
      const ref = window._FB.doc(window._FB.db, "trips", "gokarna");
      fbDocRef = ref;
      await window._FB.setDoc(ref, { itinerary, checklist, updatedAt }, { merge: true });
    }
  } catch (err) {
    console.warn('Failed to save checklist to Firestore, falling back to localStorage', err);
  }

  renderChecklist();
  updateChecklistProgressStat();
}

// Start listening to Firestore shared doc (if initialized)
function startFirestoreSync() {
  try {
    if (!window._FB || !window._FB.db || !window._FB.onSnapshot || !window._FB.doc) return;

    const ref = window._FB.doc(window._FB.db, "trips", "gokarna");
    fbDocRef = ref;
    window._FB.onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists) {
        // create doc from local state
        window._FB.setDoc(ref, { itinerary, checklist, updatedAt: Date.now() }, { merge: true }).catch(() => {});
        return;
      }

      const data = snapshot.data();
      const remoteUpdated = data?.updatedAt || 0;
      // ignore updates we just wrote locally
      if (remoteUpdated && remoteUpdated <= lastLocalUpdate) return;

      if (data?.itinerary) {
        itinerary = data.itinerary;
        try { localStorage.setItem("gokarna_itinerary_data", JSON.stringify(itinerary)); } catch (e) {}
      }
      if (data?.checklist) {
        checklist = data.checklist;
        try { localStorage.setItem("gokarna_checklist_data", JSON.stringify(checklist)); } catch (e) {}
      }

      renderItinerary();
      renderChecklist();
      updateTotalExpenseStat();
      updateChecklistProgressStat();
    });
  } catch (err) {
    console.warn('Firestore sync not available', err);
  }
}

// 2. Render Itinerary Timeline
function renderItinerary() {
  const container = document.getElementById("itinerary-list");
  container.innerHTML = "";

  itinerary.forEach(day => {
    const isExpanded = expandedDays.has(day.dayNum);
    
    // Create Day Card
    const dayCard = document.createElement("div");
    dayCard.className = `day-card glass-panel ${isExpanded ? "expanded" : ""}`;
    dayCard.setAttribute("data-day", day.dayNum);

    // Build badges HTML
    let badgesHtml = "";
    day.badges.forEach(b => {
      badgesHtml += `<span class="highlight-badge">${escapeHTML(b)}</span>`;
    });

    // Day Header
    const header = document.createElement("div");
    header.className = "day-header";
    header.innerHTML = `
      <div class="day-info-left">
        <div class="day-num">D${day.dayNum}</div>
        <div class="day-title-box">
          <h3>${escapeHTML(day.title)}</h3>
          <span class="day-meta-text">${day.dateText}</span>
        </div>
      </div>
      <div class="day-highlights">${badgesHtml}</div>
      <div class="day-header-actions">
        <button type="button" class="btn btn-sm btn-accent add-day-btn" data-day="${day.dayNum}" title="Add a new milestone to Day ${day.dayNum}">
          <i data-lucide="plus"></i> Add
        </button>
        <i data-lucide="chevron-down" class="chevron-icon"></i>
      </div>
    `;

    const addButton = header.querySelector(".add-day-btn");
    addButton.addEventListener("click", (e) => {
      e.stopPropagation();
      openCreateMilestoneModal(day.dayNum);
    });

    // Toggle Expansion
    header.addEventListener("click", (e) => {
      if (e.target.classList.contains("highlight-badge") || e.target.closest(".add-day-btn")) return;
      
      if (expandedDays.has(day.dayNum)) {
        expandedDays.delete(day.dayNum);
        dayCard.classList.remove("expanded");
      } else {
        expandedDays.add(day.dayNum);
        dayCard.classList.add("expanded");
      }
    });

    // Day Body (Timeline milestones)
    const body = document.createElement("div");
    body.className = "day-body";
    
    const timelinePath = document.createElement("div");
    timelinePath.className = "timeline-path";

    day.milestones.forEach((milestone, mIdx) => {
      const item = document.createElement("div");
      
      // Highlight important stops (like check-in, sunset, major treks, water sports)
      const isImportant = milestone.tag.toLowerCase().includes("trek") || 
                           milestone.tag.toLowerCase().includes("sunset") || 
                           milestone.tag.toLowerCase().includes("sports") || 
                           milestone.tag.toLowerCase().includes("hotel") ||
                           milestone.tag.toLowerCase().includes("feast");
                           
      item.className = `timeline-item active ${isImportant ? "important" : ""}`;

      // Expense Badge HTML
      let expenseBadgeHtml = "";
      if (milestone.expense && milestone.expense > 0) {
        expenseBadgeHtml = `
          <span class="timeline-expense-badge" title="Local expense spent at this location">
            <i data-lucide="indian-rupee" style="width: 12px; height: 12px;"></i>${milestone.expense.toLocaleString("en-IN")}
            <button type="button" class="delete-expense-pill" data-day="${day.dayNum}" data-id="${milestone.id}" title="Remove this expense">×</button>
          </span>
        `;
      }

      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-time">${escapeHTML(milestone.time)}</div>
          <h4>${escapeHTML(milestone.title)} ${expenseBadgeHtml}</h4>
          <p>${escapeHTML(milestone.desc)}</p>
          <span class="timeline-tag">${escapeHTML(milestone.tag)}</span>
        </div>
        <div class="timeline-controls">
          <!-- Quick Edit Button -->
          <button class="timeline-control-btn edit-btn" title="Edit milestone details" 
            data-day="${day.dayNum}" data-id="${milestone.id}">
            <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
          </button>
          <!-- Quick Add Expense Button -->
          <button class="timeline-control-btn expense-btn" title="Add expense to this location" 
            data-day="${day.dayNum}" data-id="${milestone.id}">
            <i data-lucide="wallet" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      `;

      // Attach control events
      item.querySelector(".edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openEditMilestoneModal(day.dayNum, milestone);
      });

      item.querySelector(".expense-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openAddExpenseModal(day.dayNum, milestone);
      });

      const deleteExpenseBtn = item.querySelector(".delete-expense-pill");
      if (deleteExpenseBtn) {
        deleteExpenseBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const dayNum = parseInt(deleteExpenseBtn.getAttribute("data-day"), 10);
          const mId = deleteExpenseBtn.getAttribute("data-id");
          const dayObj = itinerary.find(d => d.dayNum === dayNum);
          if (dayObj) {
            const expenseMilestone = dayObj.milestones.find(m => m.id === mId);
            if (expenseMilestone) {
              expenseMilestone.expense = 0;
              saveItinerary();
            }
          }
        });
      }

      timelinePath.appendChild(item);
    });

    body.appendChild(timelinePath);
    dayCard.appendChild(header);
    dayCard.appendChild(body);
    container.appendChild(dayCard);
  });

  lucide.createIcons();
}

// 3. Render Checklist
function renderChecklist() {
  const container = document.getElementById("checklist-render-list");
  if (checklist.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0;">No luggage items configured. Add some above!</div>`;
    return;
  }

  const filtered = activeCategoryFilter === "All"
    ? checklist
    : checklist.filter(item => item.category === activeCategoryFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0;">No packed items in category "${activeCategoryFilter}".</div>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(item => {
    const row = document.createElement("div");
    row.className = `checklist-item ${item.checked ? "checked" : ""}`;
    row.innerHTML = `
      <div class="item-left">
        <label class="custom-checkbox">
          <input type="checkbox" class="checklist-toggle-trigger" data-id="${item.id}" ${item.checked ? "checked" : ""}>
          <span class="checkmark"></span>
        </label>
        <span class="item-text">${escapeHTML(item.text)}</span>
        <span class="item-badge">${item.category}</span>
      </div>
      <div class="item-right">
        <button class="delete-btn checklist-delete-trigger" data-id="${item.id}" title="Remove item"><i data-lucide="trash-2"></i></button>
      </div>
    `;

    // Checkbox toggling
    row.querySelector(".checklist-toggle-trigger").addEventListener("change", (e) => {
      item.checked = e.target.checked;
      saveChecklist();
    });

    // Delete item
    row.querySelector(".checklist-delete-trigger").addEventListener("click", () => {
      checklist = checklist.filter(c => c.id !== item.id);
      saveChecklist();
    });

    container.appendChild(row);
  });

  lucide.createIcons();
}

// 4. Update Header Statistics
function updateTotalExpenseStat() {
  let total = 0;
  itinerary.forEach(day => {
    day.milestones.forEach(m => {
      total += parseFloat(m.expense || 0);
    });
  });
  document.getElementById("stats-total-budget").innerText = `₹${total.toLocaleString("en-IN")}`;
}

function updateChecklistProgressStat() {
  const total = checklist.length;
  const packed = checklist.filter(c => c.checked).length;
  document.getElementById("stats-packed-status").innerText = `${packed} / ${total}`;
}

// 5. Modal Operations
// Edit Milestone Modal
const editModal = document.getElementById("edit-milestone-modal");
function openEditMilestoneModal(dayNum, milestone) {
  document.getElementById("edit-mode").value = "edit";
  document.getElementById("edit-day-num").value = dayNum;
  document.getElementById("edit-milestone-id").value = milestone.id;
  document.getElementById("edit-time").value = milestone.time;
  document.getElementById("edit-title").value = milestone.title;
  document.getElementById("edit-desc").value = milestone.desc;
  document.getElementById("edit-tag").value = milestone.tag;

  editModal.querySelector(".modal-header h3").innerText = "Edit Timeline Milestone";
  editModal.classList.add("active");
}

function openCreateMilestoneModal(dayNum) {
  document.getElementById("edit-mode").value = "create";
  document.getElementById("edit-day-num").value = dayNum;
  document.getElementById("edit-milestone-id").value = "";
  document.getElementById("edit-time").value = "";
  document.getElementById("edit-title").value = "";
  document.getElementById("edit-desc").value = "";
  document.getElementById("edit-tag").value = "";

  editModal.querySelector(".modal-header h3").innerText = `Add New Milestone for Day ${dayNum}`;
  editModal.classList.add("active");
}

function closeEditMilestoneModal() {
  editModal.classList.remove("active");
  document.getElementById("edit-milestone-form").reset();
}

// Add Expense Modal
const expenseModal = document.getElementById("add-expense-modal");
function openAddExpenseModal(dayNum, milestone) {
  document.getElementById("expense-day-num").value = dayNum;
  document.getElementById("expense-milestone-id").value = milestone.id;
  document.getElementById("expense-modal-location-name").innerText = milestone.title;
  
  expenseModal.classList.add("active");
  document.getElementById("exp-amount").focus();
}

function closeAddExpenseModal() {
  expenseModal.classList.remove("active");
  document.getElementById("expense-add-form").reset();
}

// 6. Set Up App Handlers
function setupAppListeners() {
  // Navigation Tabs Switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      document.getElementById(`tab-${tabId}`).classList.add("active");
    });
  });

  // Checklist Category Filters
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategoryFilter = btn.getAttribute("data-category");
      renderChecklist();
    });
  });

  // Checklist Form Add Item
  document.getElementById("checklist-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const textInput = document.getElementById("checklist-input");
    const categorySelect = document.getElementById("checklist-category-select");

    if (!textInput.value.trim()) return;

    const newItem = {
      id: "c_" + Date.now(),
      text: textInput.value.trim(),
      category: categorySelect.value,
      checked: false
    };

    checklist.push(newItem);
    saveChecklist();

    textInput.value = "";
    textInput.focus();
  });

  // Edit / Create Milestone Form Submit
  document.getElementById("edit-milestone-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const mode = document.getElementById("edit-mode").value;
    const dayNum = parseInt(document.getElementById("edit-day-num").value);
    const mId = document.getElementById("edit-milestone-id").value;
    const time = document.getElementById("edit-time").value.trim();
    const title = document.getElementById("edit-title").value.trim();
    const desc = document.getElementById("edit-desc").value.trim();
    const tag = document.getElementById("edit-tag").value.trim();

    const day = itinerary.find(d => d.dayNum === dayNum);
    if (!day) {
      closeEditMilestoneModal();
      return;
    }

    if (mode === "edit") {
      const milestone = day.milestones.find(m => m.id === mId);
      if (milestone) {
        milestone.time = time;
        milestone.title = title;
        milestone.desc = desc;
        milestone.tag = tag;
        saveItinerary();
      }
    } else {
      const newMilestone = {
        id: `m${dayNum}_${Date.now()}`,
        time: time || "TBD",
        title: title || "New Trip Item",
        desc: desc || "Add details for this activity.",
        tag: tag || "New",
        expense: 0
      };
      day.milestones.push(newMilestone);
      expandedDays.add(dayNum);
      saveItinerary();
    }

    closeEditMilestoneModal();
  });

  // Close Modals events
  document.getElementById("close-edit-modal").addEventListener("click", closeEditMilestoneModal);
  document.getElementById("close-expense-modal").addEventListener("click", closeAddExpenseModal);

  // Close modals clicking background
  window.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditMilestoneModal();
    if (e.target === expenseModal) closeAddExpenseModal();
  });

  // Add Expense Form Submit
  document.getElementById("expense-add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const dayNum = parseInt(document.getElementById("expense-day-num").value);
    const mId = document.getElementById("expense-milestone-id").value;
    const amt = parseFloat(document.getElementById("exp-amount").value);

    if (isNaN(amt) || amt <= 0) return;

    const day = itinerary.find(d => d.dayNum === dayNum);
    if (day) {
      const milestone = day.milestones.find(m => m.id === mId);
      if (milestone) {
        // Accumulate expenses if multiple are added
        const currentExpense = parseFloat(milestone.expense) || 0;
        milestone.expense = currentExpense + amt;
        saveItinerary();
      }
    }

    closeAddExpenseModal();
  });

  // Share link copies clipboard URL
  document.getElementById("share-trip-btn").addEventListener("click", () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = document.getElementById("share-trip-btn");
      const originHtml = btn.innerHTML;
      btn.innerHTML = `<i data-lucide="check"></i> Copied Link`;
      btn.style.background = "var(--neon-green)";
      btn.style.color = "#070a13";
      lucide.createIcons();

      setTimeout(() => {
        btn.innerHTML = originHtml;
        btn.style.background = "";
        btn.style.color = "";
        lucide.createIcons();
      }, 2000);
    });
  });
}

// 7. Live Countdown Ticker
function startCountdown() {
  const targetDate = new Date("2026-05-30T04:00:00").getTime();

  function updateClock() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    const clockText = document.getElementById("countdown-value");

    if (distance < 0) {
      clockText.innerText = "Trip is Live! 🚗";
      clockText.style.color = "var(--neon-green)";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    clockText.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Escape helper to prevent HTML injection in user inputs
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Initialise App on page DOM ready
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  // start Firestore live sync (if Firebase was initialized in the page)
  startFirestoreSync();
  setupAppListeners();
  startCountdown();
  renderItinerary();
  renderChecklist();
  updateTotalExpenseStat();
  updateChecklistProgressStat();
});
