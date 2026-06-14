// ── TÁBLA RENDERELÉSE ────────────────────────────────────
function renderTable(data) {
  const tbody = document.querySelector("tbody");

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5">Nincs megjeleníthető adat</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((p) => {
      const status = getOverallStatus(p);

      return `
      <tr>
        <td>${esc(p.nev)}</td>
        <td>${formatTaj(p.taj_szam)}</td>
        <td>${p.orvosi_alkalmas ? p.orvosi_kezdete || "—" : "—"}</td>
        <td>${p.pszichologiai_alkalmas ? p.pszichologiai_kezdete || "—" : "—"}</td>
        <td><span class="status ${status}">${STATUS_LABEL[status]}</span></td>
      </tr>
    `;
    })
    .join("");
}
