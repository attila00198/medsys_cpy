const API = "/api/person";

// Az alkalmassági vizsgálat ennyi napig érvényes a kezdő dátumtól
const VALIDITY_DAYS = 30;

let allData = [];

// ── ADATOK BETÖLTÉSE ─────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch(API, {
      method: "GET",
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

// ── SEGÉDFÜGGVÉNYEK ─────────────────────────────────────

function formatTajSzam(szam) {
  return String(szam).replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3");
}

// JAVÍTVA: a hash értékadás mindig kivált hashchange-t,
// ezért elegendő egyszerűen beállítani — az egyenlőség-ág
// hibásan dispatch-elt egy extra eseményt, ami form újratöltést okozott.
function navigate(hash) {
  const next = `#${hash}`;
  if (window.location.hash === next) {
    // Ugyanoda navigálunk: manuálisan triggereljük a renderelést
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = hash;
  }
}

function getHashParams() {
  const [path, query] = window.location.hash.slice(1).split("?");
  const params = new URLSearchParams(query || "");
  return { path, params };
}

// ── ROUTER ────────────────────────────────────────────────
function initRouter(routes, container, defaultRoute = "dashboard") {
  async function renderRoute() {
    const { path, params } = getHashParams();
    const route = routes[path] ?? routes[defaultRoute];

    container.innerHTML = "";

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
  const validMedicalCount = persons.filter(p => !p.is_med_expired).length;
  const validPsyCount = persons.filter(p => !p.is_psy_expired).length;
  const expiredMedicalCount = persons.filter(p => p.is_med_expired).length;
  const expiredPsyCount = persons.filter(p => p.is_psy_expired).length;

  const card = (title, value, extraClass = "") => {
    const c = div(h2(title), span(String(value))).setClasses("card");
    if (extraClass) c.addClass(extraClass);
    return c;
  };

  const dashboard = section(
    card("Összes személy", totalCount),
    card("Érvényes orvosi", validMedicalCount, "text-success"),
    card("Érvényes pszichológiai", validPsyCount, "text-success"),
    card("Lejárt orvosi", expiredMedicalCount, "text-danger"),
    card("Lejárt pszichológiai", expiredPsyCount, "text-danger")
  ).setClasses("dashboard");

  const toolbar = section(
    input().setId("search-input").setPlaceholder("Keresés név vagy TAJ alapján..."),
    btn("Új személy").onClick(() => navigate("new"))
  ).setClasses("toolbar");

  const tableContainer = div(renderTable(persons)).setId("table-container");

  toolbar.querySelector("#search-input").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allData.filter(p =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.taj_num && String(p.taj_num).includes(term))
    );
    tableContainer.innerHTML = "";
    tableContainer.appendChild(renderTable(filtered));
  });

  return div(dashboard, toolbar, tableContainer);
}

// ── TÁBLA ─────────────────────────────────────────────────
function renderTable(data) {
  console.table(data);
  const safeText = (v) => v ?? "";
  const rows = (Array.isArray(data) ? data : []).map(user => {
    const isMedExpired = user.is_med_expired;
    const isPsyExpired = user.is_psy_expired;
    const isInsExpired = user.is_ins_expired;

    return tr(
      td(
        a(user.name, `#profile?id=${user.id}`).setClasses("personel-link")
      ),
      td(safeText(user.birth_date)),
      td(safeText(formatTajSzam(user.taj_num))),
      td(isMedExpired ? "Lejárt" : "Érvényes")
        .setClasses("status", isMedExpired ? "text-danger" : "text-success"),
      td(isPsyExpired ? "Lejárt" : "Érvényes")
        .setClasses("status", isPsyExpired ? "text-danger" : "text-success"),
      td(isInsExpired ? "Lejárt" : "Érvényes")
        .setClasses("status", isInsExpired ? "text-danger" : "text-success")
    );
  });

  return table(
    thead(tr(
      th("Név"),
      th("Születési dátum"),
      th("TAJ szám"),
      th("Orvosi alk."),
      th("Pszichológiai alk."),
      th("Biztosítás")
    )),
    tbody(...rows)
  ).setClasses("table table-striped table-hover");
}

// ── PROFIL OLDAL ──────────────────────────────────────────
async function renderProfile(params) {
  const id = Number(params.get("id"));
  if (!id) throw new Error("Hiányzó azonosító.");

  const user = await loadPerson(id);

  if (!user) {
    return div(
      p("Személy nem található."),
      btn("← Vissza").addClass("btn-secondary").onClick(() => navigate("dashboard"))
    );
  }

  const safeText = (v) => v ?? "—";
  const isMedExpired = user.is_med_expired;
  const isPsyExpired = user.is_psy_expired;
  const isInsExpired = user.is_ins_expired;

  const initials = user.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const badge = (expired) =>
    span(expired ? "Lejárt" : "Érvényes")
      .setClasses("badge", expired ? "badge-exp" : "badge-ok");

  const certCard = (title, expiresAt, valid) => {
    const top = div(
      span(title).addClass("cert-title"),
      badge(valid)
    ).addClass("cert-top");

    const date = p().addClass("cert-date");
    date.innerHTML = `${valid ? "Lejár" : "Lejárt"}: <span>${safeText(expiresAt)}</span>`;

    return div(top, date).addClass("cert-card");
  };

  const infoRow = (icon, label, value) =>
    div(
      span(
        i().setClasses(`bi bi-${icon}`),
        `${label}`
      ).addClass("info-key"),
      span(safeText(value)).addClass("info-val")
    ).addClass("info-row");

  return div(
    div(
      btn("← Vissza").addClass("btn-secondary").onClick(() => navigate("dashboard")),
      btn("Szerkesztés").addClass("btn-primary").onClick(() => navigate(`edit?id=${id}`))
    ).addClass("back-row"),

    div(
      div(initials).addClass("avatar"),
      div(
        p(safeText(user.name)).addClass("avatar-name"),
        p(`Azonosító: #${user.id}`).addClass("avatar-sub")
      )
    ).addClass("avatar-row"),

    p("Személyes adatok").addClass("section-label"),
    div(
      infoRow("calendar", "Születési dátum", user.birth_date),
      infoRow("person-vcard", "TAJ szám", formatTajSzam(user.taj_num))
    ).addClass("info-card"),

    p("Biztosítás").addClass("section-label"),
    div(
      infoRow("cash-coin", "Befizetett összeg", user.ins_payment ? `${user.ins_payment} Ft` : "—")
    ).addClass("info-card"),

    p("Érvényességek").addClass("section-label"),
    div(
      certCard("Orvosi alk.", user.med_expires_at, isMedExpired),
      certCard("Pszichológiai alk.", user.psy_expires_at, isPsyExpired),
      certCard("Biztosítás", user.ins_expires_at, isInsExpired)
    ).addClass("cert-grid")

  ).addClass("profile-wrap");
}

// ── FORM OLDAL (új személy / szerkesztés) ─────────────────
async function renderForm(params) {
  const id = Number(params.get("id"));
  const user = id ? await loadPerson(id) : null;
  const isEdit = Boolean(user);

  const nameInput = input()
    .setId("f-name").setName("name").setPlaceholder("Teljes név").addClass("form-control");
  const birthInput = input("date")
    .setId("f-birth").setName("birth_date").addClass("form-control");
  const tajInput = input("number")
    .setId("f-taj").setName("taj_num").setPlaceholder("123456789").addClass("form-control");
  const medInput = input("date")
    .setId("f-med").setName("med_expires_at").addClass("form-control");
  const psyInput = input("date")
    .setId("f-psy").setName("psy_expires_at").addClass("form-control");
  const insInput = input("date")
    .setId("f-ins").setName("ins_expires_at").addClass("form-control");
  const paymentInput = input("number")
    .setId("f-payment").setName("ins_payment").setPlaceholder("15000 ft.").addClass("form-control");

  if (isEdit) {
    nameInput.setValue(user.name ?? "");
    birthInput.setValue(user.birth_date ?? "");
    tajInput.setValue(user.taj_num ?? "");
    medInput.setValue(user.med_expires_at ?? "");
    psyInput.setValue(user.psy_expires_at ?? "");
    insInput.setValue(user.ins_expires_at ?? "");
    paymentInput.setValue(user.ins_payment ?? "");
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
    fieldGroup("Orvosi alk. lejárata:", medInput, "f-med"),
    fieldGroup("Pszichológiai alk. lejárata:", psyInput, "f-psy"),
    fieldGroup("Biztosítás lejárata:", insInput, "f-ins"),
    fieldGroup("Befizetett összeg: ", paymentInput, "f-payment"),
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
      name: data.get("name"),
      birth_date: data.get("birth_date"),
      taj_num: data.get("taj_num"),
      med_expires_at: data.get("med_expires_at") || null,
      psy_expires_at: data.get("psy_expires_at") || null,
      ins_expires_at: data.get("ins_expires_at") || null,
      ins_payment: data.get("ins_payment") || null,
    };
    console.table(payload)

    try {
      const res = await fetch(API + (isEdit ? `?id=${id}` : ""), {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      //await loadData();
      // JAVÍTVA: a céloldal hash-e a jelenlegi hash-sel (#edit?id=X) sosem egyezik,
      // ezért a navigate egyszerű hash értékadással dolgozik — ez mindig kivált
      // hashchange eseményt, a router átnavigál a profil oldalra.
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
    ).addClass("back-row"),
    h2(isEdit ? `${user.name} szerkesztése` : "Új személy felvétele").addClass("avatar-name"),
    formEl
  ).addClass("profile-wrap");
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