(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const backToTop = document.querySelector('[data-back-to-top]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

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
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
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
        .map((link) => [decodeURIComponent((link.getAttribute('href') || '').slice(1)), link])
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
})();
