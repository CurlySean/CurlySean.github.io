(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const backToTop = document.querySelector('[data-back-to-top]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeKey = 'sheepfold-theme';

  const syncThemeUi = (theme) => {
    const dark = theme === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', dark ? meta.dataset.themeColorDark || '#161614' : meta.dataset.themeColorLight || '#f7f7f4');
    }
    if (themeToggle) {
      const label = themeToggle.querySelector('[data-theme-toggle-label]');
      if (label) label.textContent = dark ? '浅色' : '暗色';
      themeToggle.setAttribute('aria-pressed', String(dark));
    }
  };

  const currentTheme = () => root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  syncThemeUi(currentTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(themeKey, next); } catch (error) { /* ignore */ }
      syncThemeUi(next);
    });
  }

  if (menuToggle && mobileMenu) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };

    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  const revealEls = [...document.querySelectorAll('.reveal')];
  const showIfOnscreen = () => {
    revealEls.forEach((element) => {
      if (element.classList.contains('is-visible')) return;
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) element.classList.add('is-visible');
    });
  };
  showIfOnscreen();

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -7% 0px', threshold: 0.06 }
    );
    revealEls.forEach((element) => revealObserver.observe(element));
  } else {
    revealEls.forEach((element) => element.classList.add('is-visible'));
  }

  let lastScrollY = window.scrollY;
  const onScroll = () => {
    const currentScrollY = window.scrollY;
    if (header && !document.body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', currentScrollY > lastScrollY && currentScrollY > 180);
    }
    if (backToTop) backToTop.classList.toggle('is-visible', currentScrollY > 700);
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const linkById = new Map(
      tocLinks
        .map((link) => {
          const raw = (link.getAttribute('href') || '').slice(1);
          let id = raw;
          try { id = decodeURIComponent(raw); } catch (error) { id = raw; }
          return [id, link];
        })
        .filter(([id]) => id)
    );
    const headings = [...linkById.keys()]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const tocObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tocLinks.forEach((link) => link.classList.remove('is-active'));
          const activeLink = linkById.get(entry.target.id);
          if (activeLink) activeLink.classList.add('is-active');
        });
      },
      { rootMargin: '-20% 0px -72% 0px' }
    );
    headings.forEach((heading) => tocObserver.observe(heading));
  }

  document.querySelectorAll('figure.highlight').forEach((figure) => {
    const lang = [...figure.classList].find((name) => name !== 'highlight');
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    if (lang && !/^(plaintext|plain|text)$/i.test(lang)) {
      const cap = document.createElement('span');
      cap.className = 'code-lang';
      cap.textContent = lang;
      toolbar.appendChild(cap);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      const code = figure.querySelector('.code') || figure;
      try {
        await navigator.clipboard.writeText(code.innerText);
        button.textContent = '已复制';
        setTimeout(() => { button.textContent = '复制'; }, 1600);
      } catch (error) {
        button.textContent = '失败';
      }
    });
    toolbar.appendChild(button);
    figure.insertBefore(toolbar, figure.firstChild);
  });
})();
