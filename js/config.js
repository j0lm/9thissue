const root = document.getElementById('config-root');

fetch('config.json')
  .then(r => r.json())
  .then(render)
  .catch(() => {
    root.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">Could not load config. Serve the site over HTTP to preview locally.</p>';
  });

function render(data) {
  const sections = [
    { key: 'specs',       title: 'PC Specs'    },
    { key: 'peripherals', title: 'Peripherals'  },
    { key: 'cs2',         title: 'CS2'          },
  ];

  const linksHtml = data.links && data.links.length ? `
    <div class="config-links">
      ${data.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="config-link">${l.label} ↗</a>`).join('')}
    </div>
  ` : '';

  const sectionsHtml = sections.map(s => {
    const rows = data[s.key] || [];
    if (!rows.length) return '';
    return `
      <section class="config-section">
        <h2 class="config-section-title">${s.title}</h2>
        <div class="config-rows">
          ${rows.map(row => renderRow(row)).join('')}
        </div>
      </section>
    `;
  }).join('');

  root.innerHTML = linksHtml + sectionsHtml;

  root.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.value;
      navigator.clipboard.writeText(value).then(() => {
        const original = btn.textContent;
        btn.textContent = 'copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });
}

function renderRow(row) {
  const isEmpty = !row.value || row.value.trim() === '';
  const valueHtml = isEmpty
    ? `<span class="config-value empty">—</span>`
    : row.mono
      ? `<span class="config-value mono">${escapeHtml(row.value)}</span>`
      : `<span class="config-value">${escapeHtml(row.value)}</span>`;

  const copyBtn = row.copy && !isEmpty
    ? `<button class="copy-btn" data-value="${escapeAttr(row.value)}">copy</button>`
    : '';

  return `
    <div class="config-row">
      <span class="config-label">${escapeHtml(row.label)}</span>
      <div class="config-value-wrap">${valueHtml}${copyBtn}</div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
