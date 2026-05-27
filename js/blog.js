const listView   = document.querySelector('.blog-list-view');
const detailView = document.getElementById('blog-detail');
const blogList   = document.getElementById('blog-list');
const searchEl   = document.getElementById('search');
const tagFilter  = document.getElementById('tag-filter');
const postCount  = document.getElementById('post-count');

let allPosts = [];
let activeTag = null;

// ── Fetch & init ──────────────────────────────────────────────

fetch('posts.json')
  .then(r => r.json())
  .then(data => {
    allPosts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    buildTagFilter();
    const slug = new URLSearchParams(location.search).get('post');
    if (slug) {
      const post = allPosts.find(p => p.slug === slug);
      post ? showDetail(post) : renderList(allPosts);
    } else {
      renderList(allPosts);
    }
  })
  .catch(() => {
    blogList.innerHTML = '<p class="no-results">Could not load posts. Make sure the site is served over HTTP (not opened as a local file).</p>';
  });

// ── Render list ───────────────────────────────────────────────

function renderList(posts) {
  listView.classList.remove('hidden');
  detailView.classList.remove('visible');

  postCount.textContent = posts.length === 1 ? '1 post' : `${posts.length} posts`;

  if (!posts.length) {
    blogList.innerHTML = '<p class="no-results">no posts found.</p>';
    return;
  }

  blogList.innerHTML = posts.map(post => `
    <article class="blog-card${post.featured ? ' featured' : ''}" data-slug="${post.slug}">
      <div class="post-meta">
        <time class="post-date">${formatDate(post.date)}</time>
        <div class="post-tags">
          ${(post.tags || []).map(t => `<span class="post-tag">#${t}</span>`).join('')}
        </div>
      </div>
      <h2 class="post-title">${post.title}</h2>
      ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
    </article>
  `).join('');

  blogList.querySelectorAll('.blog-card').forEach(card => {
    card.addEventListener('click', () => {
      const post = allPosts.find(p => p.slug === card.dataset.slug);
      if (post) {
        history.pushState({}, '', `?post=${post.slug}`);
        showDetail(post);
      }
    });
  });
}

// ── Render detail ─────────────────────────────────────────────

function showDetail(post) {
  listView.classList.add('hidden');
  detailView.classList.add('visible');
  window.scrollTo(0, 0);

  document.getElementById('detail-title').textContent = post.title;
  document.getElementById('detail-date').textContent = formatDate(post.date);
  document.getElementById('detail-tags').innerHTML =
    (post.tags || []).map(t => `<span class="post-tag">#${t}</span>`).join('');
  document.getElementById('detail-content').innerHTML =
    typeof marked !== 'undefined' ? marked.parse(post.content || '') : post.content || '';
}

document.getElementById('back-btn').addEventListener('click', () => {
  history.pushState({}, '', location.pathname);
  renderList(filtered());
});

window.addEventListener('popstate', () => {
  const slug = new URLSearchParams(location.search).get('post');
  if (slug) {
    const post = allPosts.find(p => p.slug === slug);
    if (post) { showDetail(post); return; }
  }
  renderList(filtered());
});

// ── Search & filter ───────────────────────────────────────────

function filtered() {
  const q = searchEl.value.toLowerCase();
  return allPosts.filter(p => {
    const matchTag = !activeTag || (p.tags || []).includes(activeTag);
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q));
    return matchTag && matchSearch;
  });
}

searchEl.addEventListener('input', () => renderList(filtered()));

function buildTagFilter() {
  const tags = [...new Set(allPosts.flatMap(p => p.tags || []))].sort();
  tagFilter.innerHTML = tags.map(t =>
    `<button class="tag-btn" data-tag="${t}">#${t}</button>`
  ).join('');

  tagFilter.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (activeTag === tag) {
        activeTag = null;
        btn.classList.remove('active');
      } else {
        activeTag = tag;
        tagFilter.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      renderList(filtered());
    });
  });
}

// ── Utils ─────────────────────────────────────────────────────

function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
