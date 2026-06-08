(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    document.querySelectorAll("img[data-cover]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("no-image");
        var wrapper = image.closest(".poster-wrap, .rank-cover");
        if (wrapper) {
          wrapper.classList.add("no-image");
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")));
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var searchInput = document.querySelector("[data-page-search]");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    if (searchInput) {
      searchInput.value = queryValue;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var activeFilters = filters.map(function (filter) {
        return {
          key: filter.getAttribute("data-filter"),
          value: normalize(filter.value)
        };
      });

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var visible = !keyword || text.indexOf(keyword) !== -1;

        activeFilters.forEach(function (item) {
          if (!item.value || !visible) {
            return;
          }

          var dataValue = normalize(card.getAttribute("data-" + item.key));
          visible = dataValue.indexOf(item.value) !== -1;
        });

        card.classList.toggle("hidden-card", !visible);
      });
    }

    if (searchInput || filters.length) {
      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }
      filters.forEach(function (filter) {
        filter.addEventListener("change", applyFilters);
      });
      applyFilters();
    }
  });
})();
