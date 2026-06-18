// ── TÁBLA RENDERELÉSE ────────────────────────────────────
function renderTable(data) {
  const tbody = document.querySelector("tbody");

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="9">Nincs megjeleníthető adat</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((p) => {
      const status = getOverallStatus(p);
      const orvosi = p.orvosi_alkalmas ? "Igen" : "Nem";
      const pszich = p.pszichologiai_alkalmas ? "Igen" : "Nem";

      return `
      <tr>
        <td>${esc(p.nev)}</td>
        <td>${esc(p.szuletesi_ido || "—")}</td>
        <td>${formatTaj(p.taj_szam)}</td>
        <td>${orvosi}</td>
        <td>${esc(p.orvosi_kezdete || "—")}</td>
        <td>${pszich}</td>
        <td>${esc(p.pszichologiai_kezdete || "—")}</td>
        <td>${esc(p.megjegyzes || "—")}</td>
        <td><span class="status ${status}">${STATUS_LABEL[status]}</span></td>
      </tr>
    `;
    })
    .join("");
}
