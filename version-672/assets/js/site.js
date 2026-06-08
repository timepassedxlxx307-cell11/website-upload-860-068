(function () {
  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  const searchLayer = document.querySelector("[data-search-layer]");
  const searchInput = document.querySelector("[data-site-search]");
  const searchResults = document.querySelector("[data-search-results]");

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-solid", window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && header && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  function openSearch() {
    if (!searchLayer) {
      return;
    }
    searchLayer.classList.add("is-open");
    searchLayer.setAttribute("aria-hidden", "false");
    window.setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
    renderSearch("");
  }

  function closeSearch() {
    if (!searchLayer) {
      return;
    }
    searchLayer.classList.remove("is-open");
    searchLayer.setAttribute("aria-hidden", "true");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    const source = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    const keyword = String(query || "").trim().toLowerCase();
    const list = source
      .filter(function (movie) {
        if (!keyword) {
          return movie.featured;
        }
        return String(movie.search || "").toLowerCase().includes(keyword);
      })
      .slice(0, 24);

    if (list.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      return;
    }

    searchResults.innerHTML = list.map(function (movie) {
      return '<a class="search-item" href="' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<div>' +
          '<h3>' + escapeHtml(movie.title) + '</h3>' +
          '<p>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.summary) + '</p>' +
        '</div>' +
      '</a>';
    }).join("");
  }

  document.querySelectorAll("[data-search-open]").forEach(function (button) {
    button.addEventListener("click", openSearch);
  });

  document.querySelectorAll("[data-search-close]").forEach(function (button) {
    button.addEventListener("click", closeSearch);
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearch();
    }
  });

  const sliders = document.querySelectorAll("[data-hero-slider]");
  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (slides.length === 0) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll("[data-page-filter]").forEach(function (input) {
    const selector = input.getAttribute("data-page-filter");
    const scope = selector ? document.querySelector(selector) : null;
    const cards = scope ? Array.from(scope.querySelectorAll("[data-card]")) : [];

    input.addEventListener("input", function () {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = String(card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword !== "" && !text.includes(keyword));
      });
    });
  });
})();
