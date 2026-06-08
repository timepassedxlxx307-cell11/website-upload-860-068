(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('.hero-slider');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dots button'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterInput = document.getElementById('movieSearchInput');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  var emptyState = document.querySelector('.empty-state');

  function applyFilter(value) {
    var query = String(value || '').trim().toLowerCase();
    var visible = 0;
    filterCards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var hit = !query || haystack.indexOf(query) !== -1;
      card.style.display = hit ? '' : 'none';
      if (hit) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      filterInput.value = initial;
    }
    applyFilter(filterInput.value);
    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();
