const API = "/api/index.php";

// Az alkalmassági vizsgálat ennyi napig érvényes a kezdő dátumtól
const VALIDITY_DAYS = 30;

let allData = [];

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const search = document.querySelector(".toolbar input");
  let timer = null;
  search.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => renderTable(filterData(search.value)), 250);
  });
});

// ── ADATOK BETÖLTÉSE ─────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch(`${API}`, {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
    });
    const json = await res.json();

    if (!json.ok) throw new Error(json.error);

    const payload = json.data;
    allData = Array.isArray(payload)
      ? payload
      : payload
        ? [payload]
        : [];

    renderTable(allData);
    renderStats(allData);
  } catch (err) {
    console.error("Hiba az adatok betöltésekor:", err.message);
    document.querySelector("tbody").innerHTML =
      `<tr><td colspan="9">Hiba: ${err.message}</td></tr>`;
  }
}

// ── KERESÉS ──────────────────────────────────────────────
function filterData(term) {
  term = term.trim().toLowerCase();
  if (!term) return allData;

  return allData.filter(
    (p) =>
      (p.nev || "").toLowerCase().includes(term) ||
      (p.taj_szam || "").replace(/\D/g, "").includes(term.replace(/\D/g, "")),
  );
}

// ── ÉRVÉNYESSÉG SZÁMÍTÁSA ────────────────────────────────
function getValidity(startDate) {
  if (!startDate) return "missing";

  const start = new Date(startDate);
  const expires = new Date(start);
  expires.setDate(expires.getDate() + VALIDITY_DAYS);

  return expires >= new Date() ? "valid" : "expired";
}

function getOverallStatus(person) {
  const o = getValidity(person.orvosi_alkalmas ? person.orvosi_kezdete : null);
  const p = getValidity(
    person.pszichologiai_alkalmas ? person.pszichologiai_kezdete : null,
  );

  if (o === "missing" || p === "missing") return "missing";
  if (o === "expired" || p === "expired") return "expired";
  return "valid";
}

const STATUS_LABEL = {
  valid: "Érvényes",
  expired: "Lejárt",
  missing: "Nincs adat",
};

// ── DASHBOARD STATISZTIKÁK ───────────────────────────────
function renderStats(data) {
  const cards = document.querySelectorAll(".card span");

  const total = data.length;
  const validOrvosi = data.filter(
    (p) => getValidity(p.orvosi_alkalmas ? p.orvosi_kezdete : null) === "valid",
  ).length;
  const expiredOrv = data.filter(
    (p) =>
      getValidity(p.orvosi_alkalmas ? p.orvosi_kezdete : null) === "expired",
  ).length;
  const expiredPszi = data.filter(
    (p) =>
      getValidity(p.pszichologiai_alkalmas ? p.pszichologiai_kezdete : null) ===
      "expired",
  ).length;

  cards[0].textContent = total;
  cards[1].textContent = validOrvosi;
  cards[2].textContent = expiredOrv;
  cards[3].textContent = expiredPszi;
}

// ── SEGÉDFÜGGVÉNYEK ──────────────────────────────────────
function formatTaj(taj) {
  if (!taj) return "—";
  const d = taj.replace(/\D/g, "");
  return d.length === 9
    ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`
    : taj;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
