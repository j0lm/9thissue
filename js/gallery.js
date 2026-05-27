const grid       = document.getElementById('gallery-grid');
const modal      = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalIframe = document.getElementById('modal-iframe');
const modalClose = document.getElementById('modal-close');

const PLAY_ICON = `
  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.55)"/>
    <polygon points="32,24 32,56 58,40" fill="currentColor"/>
  </svg>
`;

// ── Fetch & render ────────────────────────────────────────────

fetch('videos.json')
  .then(r => r.json())
  .then(data => {
    grid.innerHTML = data.videos.map((v, i) => `
      <div class="video-card" data-id="${v.id}" data-title="${escapeAttr(v.title)}" tabindex="0">
        <div class="video-thumb">
          <img
            src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg"
            alt="${escapeAttr(v.title)}"
            loading="${i < 6 ? 'eager' : 'lazy'}"
            onerror="this.style.opacity='0'"
          >
          <div class="play-overlay">${PLAY_ICON}</div>
        </div>
        <div class="video-info">
          <p class="video-title">${escapeHtml(v.title)}</p>
          ${v.description ? `<p class="video-desc">${escapeHtml(v.description)}</p>` : ''}
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.id, card.dataset.title));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openModal(card.dataset.id, card.dataset.title);
      });
    });
  })
  .catch(() => {
    grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">Could not load videos. Make sure the site is served over HTTP.</p>';
  });

// ── Modal ─────────────────────────────────────────────────────

function openModal(id, title) {
  modalTitle.textContent = title;
  modalIframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modalIframe.src = '';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

// ── Utils ─────────────────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
