const API = "/api/index.php";

// Az alkalmassági vizsgálat ennyi napig érvényes a kezdő dátumtól
const VALIDITY_DAYS = 30;

let allData = [];

// ── ADATOK BETÖLTÉSE ─────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch(API, {
      method: "GET",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    const payload = json.data;
    allData = Array.isArray(payload) ? payload : payload ? [payload] : [];
  } catch (err) {
    console.error("Hiba az adatok betöltésekor:", err.message);
    allData = [];
  }
}

async function loadPerson(id) {
  const res = await fetch(`${API}?id=${id}`, {
    method: "GET",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

// ── SEGÉDFÜGGVÉNYEK ───────────────────────────────────────
function checkValidity(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const diffTime = now - date; // negatív = jövőbeli dátum
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= VALIDITY_DAYS;
}

function formatTajSzam(szam) {
  return String(szam).replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3");
}

function navigate(hash) {
  window.location.hash = hash;
}

function getHashParams() {
  const [path, query] = window.location.hash.slice(1).split("?");
  const params = new URLSearchParams(query || "");
  return { path, params };
}

// ── ROUTER ────────────────────────────────────────────────
// Saját router, mert a basicRouter nem kezeli a ?query paramétereket,
// és nem támogatja az async render függvényeket.
function initRouter(routes, container, defaultRoute = "dashboard") {
  async function renderRoute() {
    const { path, params } = getHashParams();
    const route = routes[path] ?? routes[defaultRoute];

    container.innerHTML = "";

    // Töltés jelző amíg az async oldal betölt
    const loader = p("Betöltés...").setStyle({ color: "var(--text-muted)", padding: "1rem" });
    container.appendChild(loader);

    try {
      const content = await route(params);
      container.innerHTML = "";
      container.appendChild(content);
    } catch (err) {
      container.innerHTML = "";
      container.appendChild(
        div(
          p(`Hiba: ${err.message}`),
          btn("← Vissza a főoldalra").onClick(() => navigate("dashboard"))
        )
      );
    }
  }

  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}

// ── DASHBOARD OLDAL ───────────────────────────────────────
async function renderDashboard() {
  const persons = Array.isArray(allData) ? allData : [];
  const totalCount = persons.length;
  const validMedicalCount = persons.filter(p => checkValidity(p.orvosi_kezdete)).length;
  const validPsychologicalCount = persons.filter(p => checkValidity(p.pszichologiai_kezdete)).length;
  const expiredMedicalCount = totalCount - validMedicalCount;
  const expiredPsychologicalCount = totalCount - validPsychologicalCount;

  const card = (title, value, extraClass = "") => {
    const c = div(h2(title), span(String(value))).setClasses("card");
    if (extraClass) c.addClass(extraClass);
    return c;
  };

  const dashboard = section(
    card("Összes személy", totalCount),
    card("Érvényes orvosi", validMedicalCount, "text-success"),
    card("Érvényes pszichológiai", validPsychologicalCount, "text-success"),
    card("Lejárt orvosi", expiredMedicalCount, "text-danger"),
    card("Lejárt pszichológiai", expiredPsychologicalCount, "text-danger")
  ).setClasses("dashboard");

  const toolbar = section(
    input().setId("search-input").setPlaceholder("Keresés név vagy TAJ alapján..."),
    btn("Új személy").onClick(() => navigate("new"))
  ).setClasses("toolbar");

  const tableContainer = div(renderTable(persons)).setId("table-container");

  toolbar.querySelector("#search-input").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allData.filter(p =>
      (p.nev && p.nev.toLowerCase().includes(term)) ||
      (p.taj_szam && String(p.taj_szam).includes(term))
    );
    tableContainer.innerHTML = "";
    tableContainer.appendChild(renderTable(filtered));
  });

  return div(dashboard, toolbar, tableContainer);
}

// ── TÁBLA ─────────────────────────────────────────────────
function renderTable(data) {
  const safeText = (v) => v ?? "";
  const rows = (Array.isArray(data) ? data : []).map(person => {
    const orvValid = checkValidity(person.orvosi_kezdete);
    const pszValid = checkValidity(person.pszichologiai_kezdete);

    return tr(
      td(
        a(person.nev, `#profile?id=${person.id}`).setClasses("personel-link")
      ),
      td(safeText(person.szuletesi_ido)),
      td(safeText(formatTajSzam(person.taj_szam))),
      td(orvValid ? "Érvényes" : "Lejárt")
        .setClasses("status", orvValid ? "text-success" : "text-danger"),
      td(pszValid ? "Érvényes" : "Lejárt")
        .setClasses("status", pszValid ? "text-success" : "text-danger"),
      td(safeText(person.megjegyzes))
    );
  });

  return table(
    thead(tr(
      th("Név"),
      th("Születési dátum"),
      th("TAJ szám"),
      th("Orvosi alk."),
      th("Pszichológiai alk."),
      th("Megjegyzés")
    )),
    tbody(...rows)
  ).setClasses("table table-striped table-hover");
}

// ── PROFIL OLDAL ──────────────────────────────────────────
async function renderProfile(params) {
  const id = Number(params.get("id"));
  if (!id) throw new Error("Hiányzó azonosító.");

  const person = await loadPerson(id);

  if (!person) {
    return div(
      p("Személy nem található."),
      btn("← Vissza").addClass("btn-secondary").onClick(() => navigate("dashboard"))
    );
  }

  const safeText = (v) => v ?? "—";
  const orvValid = checkValidity(person.orvosi_kezdete);
  const pszValid = checkValidity(person.pszichologiai_kezdete);

  const statusBadge = (valid) =>
    span(valid ? "Érvényes" : "Lejárt")
      .setClasses("status", valid ? "text-success" : "text-danger");

  return div(
    div(
      btn("← Vissza").addClass("btn-secondary").onClick(() => navigate("dashboard")),
      btn("Szerkesztés").addClass("btn-primary").onClick(() => navigate(`edit?id=${id}`))
    ).setClasses("profile-actions"),
    h2(safeText(person.nev)).addClass("profile-name"),
    div(
      div(
        p(`Születési dátum: ${safeText(person.szuletesi_ido)}`),
        p(`TAJ szám: ${safeText(formatTajSzam(person.taj_szam))}`),
        p(`Megjegyzés: ${safeText(person.megjegyzes)}`)
      ).addClass("profile-info"),
      div(
        div(
          span("Orvosi alkalmasság").addClass("validity-label"),
          p(`Kezdete: ${safeText(person.orvosi_kezdete)}`),
          statusBadge(orvValid)
        ).addClass("validity-card"),
        div(
          span("Pszichológiai alkalmasság").addClass("validity-label"),
          p(`Kezdete: ${safeText(person.pszichologiai_kezdete)}`),
          statusBadge(pszValid)
        ).addClass("validity-card")
      ).addClass("validity-grid")
    ).addClass("profile-body")
  ).addClass("profile-container");
}

// ── FORM OLDAL (új személy / szerkesztés) ─────────────────
async function renderForm(params) {
  const id = Number(params.get("id"));
  const person = id ? await loadPerson(id) : null;
  const isEdit = Boolean(person);

  const nameInput = input()
    .setId("f-name").setName("name").setPlaceholder("Teljes név").addClass("form-control");
  const birthInput = input("date")
    .setId("f-birth").setName("birth-date").addClass("form-control");
  const tajInput = input("number")
    .setId("f-taj").setName("taj-number").setPlaceholder("123456789").addClass("form-control");
  const orvInput = input("date")
    .setId("f-orv").setName("orvosi-kezdete").addClass("form-control");
  const pszInput = input("date")
    .setId("f-psz").setName("pszichologiai-kezdete").addClass("form-control");
  const megjegyzesInput = textarea()
    .setId("f-megjegyzes").setName("megjegyzes").setPlaceholder("Megjegyzés...").addClass("form-control");

  if (isEdit) {
    nameInput.setValue(person.nev ?? "");
    birthInput.setValue(person.szuletesi_ido ?? "");
    tajInput.setValue(person.taj_szam ?? "");
    orvInput.setValue(person.orvosi_kezdete ?? "");
    pszInput.setValue(person.pszichologiai_kezdete ?? "");
    megjegyzesInput.setValue(person.megjegyzes ?? "");
  }

  const fieldGroup = (labelText, inputEl, targetId) =>
    div(
      label(labelText).setTarget(targetId).addClass("input-group-text"),
      inputEl
    ).setClasses("input-group", "mb-2");

  const formEl = form(
    fieldGroup("Teljes név:", nameInput, "f-name"),
    fieldGroup("Születési dátum:", birthInput, "f-birth"),
    fieldGroup("TAJ szám:", tajInput, "f-taj"),
    fieldGroup("Orvosi alk. kezdete:", orvInput, "f-orv"),
    fieldGroup("Pszichológiai alk. kezdete:", pszInput, "f-psz"),
    fieldGroup("Megjegyzés:", megjegyzesInput, "f-megjegyzes"),
    div(
      btn("Mégse").addClass("btn-secondary").onClick(() =>
        navigate(isEdit ? `profile?id=${id}` : "dashboard")
      ),
      input("submit").setValue(isEdit ? "Mentés" : "Létrehozás")
        .setClasses("btn", "btn-success")
    ).addClass("form-actions")
  ).setId("person-form");

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const payload = {
      nev: data.get("name"),
      szuletesi_ido: data.get("birth-date"),
      taj_szam: data.get("taj-number"),
      orvosi_kezdete: data.get("orvosi-kezdete") || null,
      pszichologiai_kezdete: data.get("pszichologiai-kezdete") || null,
      megjegyzes: data.get("megjegyzes") || null,
    };

    try {
      const res = await fetch(API + (isEdit ? `?id=${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      await loadData();
      navigate(isEdit ? `profile?id=${id}` : `profile?id=${json.id}`);
    } catch (err) {
      alert(`Hiba mentéskor: ${err.message}`);
    }
  });

  return div(
    div(
      btn("← Vissza").addClass("btn-secondary").onClick(() =>
        navigate(isEdit ? `profile?id=${id}` : "dashboard")
      )
    ).addClass("profile-actions"),
    h2(isEdit ? `${person.nev} szerkesztése` : "Új személy felvétele").addClass("profile-name"),
    formEl
  ).addClass("profile-container");
}

// ── INIT ──────────────────────────────────────────────────
async function init() {
  await loadData();

  const app = document.getElementById("app");

  initRouter(
    {
      dashboard: renderDashboard,
      profile: renderProfile,
      new: renderForm,
      edit: renderForm,
    },
    app,
    "dashboard"
  );
}

init();