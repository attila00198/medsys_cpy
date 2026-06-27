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

async function loadUser(id) {
  const res = await fetch(`${API}?id=${id}`, {
    method: "GET",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

async function deleteUser(id) {
  const confirmed = window.confirm("Biztosan törölni szeretnéd ezt a személyt?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${API}?id=${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();
    if (!json.ok && json.ok !== undefined) {
      throw new Error(json.error || "A törlés nem sikerült.");
    }
    navigate("dashboard");
  } catch (err) {
    alert(`Hiba törléskor: ${err.message}`);
  }
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
  const validDocsCount = validMedicalCount + validPsyCount;
  const expiredDocsCount = expiredMedicalCount + expiredPsyCount;

  const card = (title, value, extraClass = "") => {
    const c = div(h2(title), span(String(value))).setClasses("card");
    if (extraClass) c.addClass(extraClass);
    return c;
  };

  const dashboard = section(
    card("Összes személy", totalCount),
    card("Érvényes alkalmasságok", validDocsCount, "text-success"),
    card("Lejárt alkalmasságok", expiredDocsCount, "text-danger")
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

  const user = await loadUser(id);

  if (!user) {
    return div(
      p("Felhasználó nem található."),
      btn("← Vissza").addClass("btn-secondary").onClick(() => navigate("dashboard")),
      btn("← Törlés").addClass("btn-danger").onClick(() => deleteUser(id))
    );
  }

  // Profil újrarenderelése friss adatokkal (inline mentés után)
  function rebuild(freshUser) {
    const newProfile = buildProfile(freshUser);
    profileWrap.innerHTML = "";
    profileWrap.appendChild(newProfile);
    attachEditButtons(profileWrap, id, rebuild);
  }

  const profileWrap = div().setClasses("profile-wrap", "page-centered");
  profileWrap.appendChild(buildProfile(user));
  attachEditButtons(profileWrap, id, rebuild);

  return profileWrap;
}

function buildProfile(user) {
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

  const certCard = (title, expiresAt, expired) => {
    const top = div(
      span(title).addClass("cert-title"),
      badge(expired)
    ).addClass("cert-top");
    const date = p().addClass("cert-date");
    date.innerHTML = `${expired ? "Lejárt" : "Lejár"}: <span>${safeText(expiresAt)}</span>`;
    return div(top, date).addClass("cert-card");
  };

  const infoRow = (icon, labelText, value) =>
    div(
      span(
        i().setClasses(`bi bi-${icon}`),
        ` ${labelText}`
      ).addClass("info-key"),
      span(safeText(value)).addClass("info-val")
    ).addClass("info-row");

  const editBtn = (sectionName, fields) =>
    btn("✏️").setClasses("btn-icon")
      .setAttr({
        "data-edit-section": sectionName,
        "data-fields": JSON.stringify(fields),
      });

  // ── Személyes adatok szekció ──
  const personalSection = div().setAttr({ "data-section": "personal" });
  personalSection.appendChild(
    div(
      p("Személyes adatok").addClass("section-label"),
      editBtn("personal", [
        { key: "name", label: "Teljes név", type: "text", currentValue: user.name },
        { key: "birth_date", label: "Születési dátum", type: "date", currentValue: user.birth_date },
        { key: "taj_num", label: "TAJ szám", type: "number", currentValue: user.taj_num },
        { key: "remarks", label: "Megjegyzés", type: "text", currentValue: user.remarks },
      ])
    ).setStyle({ display: "flex", alignItems: "center", justifyContent: "space-between" })
  );
  personalSection.appendChild(
    div(
      infoRow("calendar", "Születési dátum", user.birth_date),
      infoRow("person-vcard", "TAJ szám", formatTajSzam(user.taj_num)),
      infoRow("chat-left-text", "Megjegyzés", user.remarks)
    ).addClass("info-card")
  );

  // ── Biztosítás szekció ──
  const insuranceSection = div().setAttr({ "data-section": "insurance" });
  insuranceSection.appendChild(
    div(
      p("Biztosítás").addClass("section-label"),
      editBtn("insurance", [
        { key: "ins_expires_at", label: "Lejárat", type: "date", currentValue: user.ins_expires_at },
        { key: "ins_payment", label: "Befizetett összeg", type: "number", currentValue: user.ins_payment },
      ])
    ).setStyle({ display: "flex", alignItems: "center", justifyContent: "space-between" })
  );
  insuranceSection.appendChild(
    div(
      infoRow("cash-coin", "Befizetett összeg", user.ins_payment ? `${user.ins_payment} Ft` : "—"),
      infoRow("calendar", "Lejárat", safeText(user.ins_expires_at)),
    ).addClass("info-card")
  );

  // ── Érvényességek szekció ──
  const certsSection = div().setAttr({ "data-section": "certs" });
  certsSection.appendChild(
    div(
      p("Érvényességek").addClass("section-label"),
      editBtn("certs", [
        { key: "med_expires_at", label: "Orvosi lejárata", type: "date", currentValue: user.med_expires_at },
        { key: "psy_expires_at", label: "Pszichológiai lejárata", type: "date", currentValue: user.psy_expires_at },
      ])
    ).setStyle({ display: "flex", alignItems: "center", justifyContent: "space-between" })
  );
  certsSection.appendChild(
    div(
      certCard("Orvosi alk.", user.med_expires_at, isMedExpired),
      certCard("Pszichológiai alk.", user.psy_expires_at, isPsyExpired),
      certCard("Biztosítás", user.ins_expires_at, isInsExpired)
    ).addClass("cert-grid")
  );

  return div(
    div(
      btn("← Vissza").addClass("btn-secondary").onClick(() => navigate("dashboard")),
      btn("🗑️ Törlés").addClass("btn-danger").onClick(() => deleteUser(user.id))
    ).addClass("back-row"),

    div(
      div(initials).addClass("avatar"),
      div(
        p(safeText(user.name)).addClass("avatar-name"),
        p(`Azonosító: #${user.id}`).addClass("avatar-sub")
      )
    ).addClass("avatar-row"),

    personalSection,
    insuranceSection,
    certsSection,
  );
}

function attachEditButtons(container, userId, onSave) {
  container.querySelectorAll("[data-edit-section]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.closest("[data-section]");
      if (!section) return;

      const existingForm = section.querySelector(".edit-form");
      if (existingForm) {
        existingForm.remove();
        return;
      }

      let fields = [];
      try {
        fields = JSON.parse(button.getAttribute("data-fields") || "[]");
      } catch (err) {
        console.error("Invalid form field config", err);
        return;
      }

      const editForm = form().setClasses("edit-form");
      const fieldList = div().addClass("edit-field-list");

      fields.forEach((field) => {
        const id = `edit-${field.key}`;
        const inputEl = field.type === "textarea"
          ? textarea().setId(id).setName(field.key).setPlaceholder(field.label)
          : input(field.type || "text").setId(id).setName(field.key);

        inputEl.setValue(field.currentValue ?? "");
        inputEl.addClass("form-control");

        if (field.type === "number") {
          inputEl.setAttr({ step: "any" });
        }

        fieldList.appendChild(
          div(
            label(field.label).setTarget(id).addClass("input-group-text"),
            inputEl
          ).setClasses("input-group", "mb-2")
        );
      });

      const actions = div(
        btn("Mégse")
          .addClass("btn-secondary")
          .onClick(() => editForm.remove()),
        input("submit")
          .setValue("Mentés")
          .setClasses("btn", "btn-success")
      ).addClass("form-actions");

      editForm.appendChild(fieldList);
      editForm.appendChild(actions);

      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {};
        const formData = new FormData(editForm);

        fields.forEach((field) => {
          const rawValue = formData.get(field.key);
          if (field.type === "number") {
            payload[field.key] = rawValue === "" ? null : Number(rawValue);
            return;
          }

          payload[field.key] = rawValue === "" ? null : rawValue;
        });

        try {
          const res = await fetch(`${API}?id=${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const json = await res.json();
          if (!json.ok) throw new Error(json.error || "A mentés sikertelen volt.");

          editForm.remove();
          if (typeof onSave === "function") {
            const refreshedUser = await loadUser(userId);
            onSave(refreshedUser);
          }
        } catch (err) {
          alert(`Hiba mentéskor: ${err.message}`);
        }
      });

      section.appendChild(editForm);
    });
  });
}

// ── FORM OLDAL (új személy / szerkesztés) ─────────────────
async function renderForm() {
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
    .setId("f-payment").setName("ins_payment").setPlaceholder("15000 Ft").addClass("form-control");

  const remarksInput = textarea()
    .setId("remarks_input")
    .setName("remarks_input")
    .setPlaceholder("Megjegyzés")
    .addClass("form-control");

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
    fieldGroup("Befizetett összeg:", paymentInput, "f-payment"),
    fieldGroup("Megjegyzések:", remarksInput, "remarks_input"),

    div(
      btn("Mégse")
        .addClass("btn-secondary")
        .onClick(() => navigate("dashboard")),

      input("submit")
        .setValue("Létrehozás")
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
      remarks: data.get("remarks_input") || null,
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      navigate(`profile?id=${json.id}`);
    } catch (err) {
      alert(`Hiba mentéskor: ${err.message}`);
    }
  });

  return div(
    div(
      btn("← Vissza")
        .addClass("btn-secondary")
        .onClick(() => navigate("dashboard"))
    ).addClass("back-row"),

    h2("Új személy felvétele").addClass("avatar-name"),

    formEl
  ).setClasses("profile-wrap", "page-centered");
}

// ── INIT ──────────────────────────────────────────────────
async function init() {
  await loadData();

  const app = document.getElementById("app");

  initRouter(
    {
      dashboard: renderDashboard,
      profile: renderProfile,
      new: renderForm,        // új személy felvétele marad
    },
    app,
    "dashboard"
  );
}

window.onload = () => {
  init();
}