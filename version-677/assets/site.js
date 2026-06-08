(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      showSlide(0);
      startTimer();
    }

    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

    roots.forEach(function (root) {
      var input = root.querySelector("#movieSearch");
      var year = root.querySelector("#yearFilter");
      var region = root.querySelector("#regionFilter");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var empty = root.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);

      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilters() {
        var q = normalize(input ? input.value : "");
        var y = normalize(year ? year.value : "");
        var r = normalize(region ? region.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.textContent
          ].join(" "));

          var matched = true;

          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }

          if (y && normalize(card.getAttribute("data-year")) !== y) {
            matched = false;
          }

          if (r && normalize(card.getAttribute("data-region")) !== r) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilters);
      }

      if (year) {
        year.addEventListener("change", applyFilters);
      }

      if (region) {
        region.addEventListener("change", applyFilters);
      }

      applyFilters();
    });
  });
}());
