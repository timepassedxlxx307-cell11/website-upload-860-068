(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileNav() {
    var button = document.querySelector(".menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function setupHeroSlider() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer;

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

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    restart();
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("form[action='search.html']");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function filterCards(input, grid) {
    var query = normalize(input.value);
    var cards = grid.querySelectorAll("[data-card]");
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
    });
  }

  function setupPageFilter() {
    var input = document.getElementById("page-filter");
    var grid = document.getElementById("filter-grid");
    if (!input || !grid) {
      return;
    }
    input.addEventListener("input", function () {
      filterCards(input, grid);
    });
  }

  function setupSearchPage() {
    var input = document.getElementById("search-page-input");
    var grid = document.getElementById("search-grid");
    if (!input || !grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
      filterCards(input, grid);
    }
    input.addEventListener("input", function () {
      filterCards(input, grid);
    });
  }

  ready(function () {
    setupMobileNav();
    setupHeroSlider();
    setupSearchForms();
    setupPageFilter();
    setupSearchPage();
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-video");
    var shell = document.getElementById("video-shell");
    var button = document.querySelector("[data-play-button]");
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = streamUrl;
        }
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        }
        return Promise.resolve();
      }
      video.src = streamUrl;
      return Promise.resolve();
    }

    function start() {
      attach().then(function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (shell) {
              shell.classList.remove("is-playing");
            }
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === video || event.target === shell) {
          start();
        }
      });
    }

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-playing");
      }
    });
  };
}());
