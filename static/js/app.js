const API = "/api/index.php";

// Az alkalmassági vizsgálat ennyi napig érvényes a kezdő dátumtól
const VALIDITY_DAYS = 30;

let allData = [];

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
  } catch (err) {
    console.error("Hiba az adatok betöltésekor:", err.message);
    document.querySelector("tbody").innerHTML =
      `<tr><td colspan="9">Hiba: ${err.message}</td></tr>`;
  }
}

// ── ÉRVÉNYESSÉG VIZSGÁLATA ─────────────────────────────
function checkValidity(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const diffTime = now - date; // nem abs! negatív = jövőbeli dátum
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= VALIDITY_DAYS;
}

function formatTajSzam(szam) {
  return String(szam).replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
}

// ── DASHBOARD RENDERELÉSE ───────────────────────────────
function renderDashboard(data) {
  const persons = Array.isArray(data) ? data : [];
  const totalCount = persons.length;
  const validMedicalCount = persons.filter(person => checkValidity(person.orvosi_kezdete)).length;
  const validPsychologicalCount = persons.filter(person => checkValidity(person.pszichologiai_kezdete)).length;
  const expiredMedicalCount = totalCount - validMedicalCount;
  const expiredPsychologicalCount = persons.filter(
    person => !checkValidity(person.pszichologiai_kezdete)
  ).length;

  const card = (title, value) => div(
    h2(title),
    span(String(value))
  ).setClasses("card");

  return section(
    card("Összes személy", totalCount),
    card("Érvényes orvosi", validMedicalCount).addClass("text-success"),
    card("Érvényes pszichológiai", validPsychologicalCount).addClass("text-success"),
    card("Lejárt orvosi", expiredMedicalCount).addClass("text-danger"),
    card("Lejárt pszichológiai", expiredPsychologicalCount).addClass("text-danger")
  )
    .setId("dashboard-container")
    .setClasses("dashboard");
}

// ── TÁBLA RENDERELÉSE ───────────────────────────────────
function renderTable(data) {
  const safeText = (value) => value ?? "";

  return table(
    thead(tr(
      th("Név"),
      th("Születési dátum"),
      th("TAJ szám"),
      th("Orvosi alk."),
      th("Pszichológiai alk."),
      th("Megjegyzés"),
    )),
    tbody(
      ...(Array.isArray(data) ? data : []).map(person => tr(
        td(a(safeText(person.nev), `edit.html?id=${person.id}`).addClass("personel-link")),
        td(safeText(person.szuletesi_ido)),
        td(safeText(formatTajSzam(person.taj_szam))),
        td(checkValidity(person.orvosi_kezdete) ? "Érvényes" : "Lejárt")
          .addClass("status")
          .addClass(checkValidity(person.orvosi_kezdete) ? "text-success" : "text-danger"),
        td(checkValidity(person.pszichologiai_kezdete) ? "Érvényes" : "Lejárt")
          .addClass("status")
          .addClass(checkValidity(person.pszichologiai_kezdete) ? "text-success" : "text-danger"),
        td(safeText(person.megjegyzes)),
      ))
    )
  )
    .setId("data-table")
    .setClasses("table table-striped table-hover")
}

function renderProfile(person) {
  const safeText = (value) => value ?? "";

  return section(
    h2(safeText(person.nev)),
    p(`Születési dátum: ${safeText(person.szuletesi_ido)}`),
    p(`TAJ szám: ${safeText(person.taj_szam)}`),
    p(`Orvosi alkalmasság kezdete: ${safeText(person.orvosi_kezdete)}`),
    p(`Pszichológiai alkalmasság kezdete: ${safeText(person.pszichologiai_kezdete)}`),
    p(`Megjegyzés: ${safeText(person.megjegyzes)}`)
  ).setId("profile-container");
}

function renderForm() {
  return section(
    form(
      div(
        label("Teljes néve:").setTarget("name").addClass("input-group-text"),
        input().setPlaceholder("Néve").setId("name").setName("name").addClass("form-control")
      ).setClasses("input-group", "mb-2", "p-2"),
      div(
        label("Születési Dátum:").setTarget("birth-date").addClass("input-group-text"),
        input("date").setId("birth-date").setName("birth-date").addClass("form-control")
      ).setClasses("input-group", "mb-2", "p-2"),
      div(
        label("Taj szám:").setTarget("taj-number").addClass("input-group-text"),
        input("number").setId("taj-number").setName("taj-number").addClass("form-control")
      ).setClasses("input-group", "mb-2", "p-2"),
      div(
        input("submit").setId("create-entry").setName("create-entry").setValue("Küldés").setClasses("btn", "btn-success")
      ).setClasses("mb-2", "p-2", "float-end"),
    ).addClass("col-8").setId("new-person-form")
  )
}

// ── KERESÉS FUNKCIÓ ─────────────────────────────────────
function filterData(searchTerm) {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return allData.filter(person =>
    (person.nev && person.nev.toLowerCase().includes(lowerSearchTerm)) ||
    (person.taj_szam && person.taj_szam.toLowerCase().includes(lowerSearchTerm))
  );
}

// ── ADATOK BETÖLTÉSE ÉS RENDERELÉSE ─────────────────────
if (window.location.pathname.endsWith("edit.html")) {
  const mainContainer = document.querySelector("main");
  const urlParams = new URLSearchParams(window.location.search);
  const personId = urlParams.get("id");
  if (!personId) {
    mainContainer.innerHTML = "";
    mainContainer.appendChild(renderForm());

    document.getElementById("new-person-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const name = formData.get("name")
      const birth_date = formData.get("birth-date")
      const taj_number = formData.get("taj-number")
      console.log(name);
      console.log(birth_date);
      console.log(formatTajSzam(taj_number));
    });
  } else {
    loadData().then(() => {
      const person = allData.find(p => p.id === Number(personId));
      if (mainContainer) {
        mainContainer.innerHTML = "";
        mainContainer.appendChild(renderProfile(person));
      }
    });
  }
} else {
  loadData().then(() => {
    const dashboardContainer = document.getElementById("dashboard-container");
    if (dashboardContainer) {
      dashboardContainer.replaceWith(renderDashboard(allData));
    }

    const tableContainer = document.getElementById("data-table-container");
    if (tableContainer) {
      tableContainer.appendChild(renderTable(allData));

      document.getElementById("new-person-button").addEventListener("click", () => {
        window.location.href = "edit.html";
      });

      // ── KERESÉS ESEMÉNYKEZELŐ ─────────────────────────────
      document.getElementById("search-input").addEventListener("input", (event) => {
        const searchTerm = event.target.value;
        const filteredData = filterData(searchTerm);
        const tableContainer = document.getElementById("data-table-container");
        if (tableContainer) {
          tableContainer.innerHTML = "";
          tableContainer.appendChild(renderTable(filteredData));
        }
      });
    }
  });
}