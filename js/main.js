(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeIcon = themeButton?.querySelector('i');
  const savedTheme = localStorage.getItem('sheepfold-theme');
  const initialTheme = savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const setTheme = (value) => {
    root.dataset.theme = value;
    if (themeIcon) themeIcon.className = value === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  };
  setTheme(initialTheme);
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sheepfold-theme', next);
  });

  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  const topButton = document.querySelector('.back-to-top');
  addEventListener('scroll', () => topButton?.classList.toggle('visible', scrollY > 600), { passive: true });
  topButton?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  document.querySelectorAll('.article-content pre').forEach((pre) => {
    const button = document.createElement('button');
    button.className = 'copy-code';
    button.type = 'button';
    button.textContent = 'COPY';
    button.addEventListener('click', async () => {
      const content = pre.innerText.replace(/^COPY(DONE)?/, '');
      try {
        await navigator.clipboard.writeText(content);
      } catch {
        const field = document.createElement('textarea');
        field.value = content;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      button.textContent = 'DONE';
      setTimeout(() => { button.textContent = 'COPY'; }, 1300);
    });
    pre.append(button);
  });

  const panel = document.querySelector('.search-panel');
  const searchInput = document.querySelector('#site-search');
  const resultBox = document.querySelector('.search-results');
  let searchData;
  const closeSearch = () => { if (panel) panel.hidden = true; };
  document.querySelector('.search-open')?.addEventListener('click', async () => {
    if (!panel) return;
    panel.hidden = false;
    searchInput?.focus();
    if (!searchData) {
      try {
        const text = await fetch('/search.xml').then((response) => response.text());
        const xml = new DOMParser().parseFromString(text, 'text/xml');
        searchData = [...xml.querySelectorAll('entry')].map((entry) => ({
          title: entry.querySelector('title')?.textContent || '',
          url: entry.querySelector('url')?.textContent || '#',
          content: entry.querySelector('content')?.textContent || ''
        }));
      } catch { searchData = []; }
    }
  });
  document.querySelector('.search-close')?.addEventListener('click', closeSearch);
  panel?.addEventListener('click', (event) => { if (event.target === panel) closeSearch(); });
  addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSearch(); });
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!resultBox) return;
    if (query.length < 2) { resultBox.innerHTML = ''; return; }
    const matches = (searchData || []).filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(query)).slice(0, 12);
    resultBox.innerHTML = matches.length ? matches.map((item) => `<article class="search-result"><a href="${item.url}">${item.title}</a><p>${item.content.replace(/<[^>]+>/g, '').slice(0, 110)}…</p></article>`).join('') : '<p>没有找到相关记录。</p>';
  });

  const headings = [...document.querySelectorAll('.article-content h2, .article-content h3, .article-content h4')];
  const tocLinks = [...document.querySelectorAll('.toc-content a')];
  if (headings.length && tocLinks.length) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      tocLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    }), { rootMargin: '-100px 0px -70% 0px' });
    headings.forEach((heading) => observer.observe(heading));
  }
})();
