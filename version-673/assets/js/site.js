(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
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
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initRails() {
    document.querySelectorAll(".content-section").forEach(function (section) {
      var row = section.querySelector(".scroll-row");
      if (!row) {
        return;
      }
      section.querySelectorAll("[data-scroll]").forEach(function (button) {
        button.addEventListener("click", function () {
          var direction = button.getAttribute("data-scroll") === "left" ? -1 : 1;
          row.scrollBy({ left: direction * 360, behavior: "smooth" });
        });
      });
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest(".content-section") || document;
      var input = panel.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(panel.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(section.querySelectorAll(".filter-card"));
      var empty = section.querySelector(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }

      function apply() {
        var term = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var ok = !term || text.indexOf(term) !== -1;
          selects.forEach(function (select) {
            var value = normalize(select.value);
            var key = select.getAttribute("data-filter-key");
            if (value && normalize(card.dataset[key]) !== value) {
              ok = false;
            }
          });
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".play-cover");
      if (!video) {
        return;
      }
      var src = video.getAttribute("data-src");
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached || !src) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime && cover) {
          cover.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initRails();
    initFilters();
    initPlayers();
  });
})();
