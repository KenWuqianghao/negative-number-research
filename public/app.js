const input = document.getElementById("number-input");
const submitBtn = document.getElementById("submit-btn");
const form = document.getElementById("search-form");
const hint = document.getElementById("input-hint");
const resultDiv = document.getElementById("result");
const header = document.getElementById("header");
const pageSearch = document.getElementById("page-search");
const pageInfo = document.getElementById("page-info");
const navSearch = document.getElementById("nav-search");
const navInfo = document.getElementById("nav-info");

let sessionFinds = 0;
let hasSearched = false;

input.addEventListener("input", () => {
  const val = input.value.trim();
  submitBtn.disabled = val === "" || val === "-";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val || val === "-") return;

  if (!hasSearched) {
    hasSearched = true;
    header.classList.remove("hidden");
  }

  input.disabled = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "...";
  hint.textContent = "checking...";
  resultDiv.classList.add("hidden");

  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

  try {
    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: val }),
    });

    const data = await res.json();

    if (!res.ok) {
      showResult("error", data.error || "Something went wrong");
    } else if (data.status === "new") {
      sessionFinds++;
      const date = formatDate(new Date(data.discoveredAt));
      showResult(
        "new",
        `<span class="result-number">${escapeHtml(data.number)}</span> is a new number!` +
          `<div class="result-meta">discovered just now</div>`
      );
    } else {
      const date = formatDate(new Date(data.discoveredAt));
      showResult(
        "found",
        `<span class="result-number">${escapeHtml(data.number)}</span> was already found` +
          `<div class="result-meta">discovered on ${date} &middot; searched ${data.searchCount.toLocaleString()} times</div>`
      );
    }
  } catch {
    showResult("error", "Failed to connect to server");
  }

  input.disabled = false;
  input.value = "";
  submitBtn.textContent = "\u2192";
  submitBtn.disabled = true;
  hint.textContent = "press enter to search";
  input.focus();
});

function showResult(type, html) {
  resultDiv.className = `result result-${type}`;
  resultDiv.innerHTML = html;
  resultDiv.classList.remove("hidden");
}

function formatDate(d) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hours}:${mins}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Client-side routing
function navigate(page) {
  if (page === "info") {
    pageSearch.classList.add("hidden");
    pageInfo.classList.remove("hidden");
    header.classList.remove("hidden");
    loadStats();
    history.pushState(null, "", "/info");
  } else {
    pageInfo.classList.add("hidden");
    pageSearch.classList.remove("hidden");
    if (!hasSearched) header.classList.add("hidden");
    history.pushState(null, "", "/");
    input.focus();
  }
}

navSearch.addEventListener("click", (e) => {
  e.preventDefault();
  navigate("search");
});

navInfo.addEventListener("click", (e) => {
  e.preventDefault();
  navigate("info");
});

window.addEventListener("popstate", () => {
  if (location.pathname === "/info") {
    navigate("info");
  } else {
    navigate("search");
  }
});

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();

    document.getElementById("stats-total").textContent =
      data.total.toLocaleString();

    document.getElementById("stats-notd").textContent =
      data.numberOfTheDay || "none yet";

    const topList = document.getElementById("stats-top");
    if (data.topSearched.length === 0) {
      topList.innerHTML = "<li>no searches yet</li>";
    } else {
      topList.innerHTML = data.topSearched
        .map(
          (item) =>
            `<li><span class="top-number">${escapeHtml(item.number)}</span><span class="top-count">${item.searches.toLocaleString()} searches</span></li>`
        )
        .join("");
    }
  } catch {
    document.getElementById("stats-total").textContent = "...";
  }
}

// Handle initial route
if (location.pathname === "/info") {
  navigate("info");
} else {
  input.focus();
}
