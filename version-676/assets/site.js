document.addEventListener('DOMContentLoaded', function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        backTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach(function(form) {
        var input = form.querySelector('[data-filter-input]');
        var scope = form.closest('main') || document;
        var list = scope.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function(card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden', query.length > 0 && text.indexOf(query) === -1);
            });
        }

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        form.addEventListener('submit', function(event) {
            if (cards.length > 0) {
                event.preventDefault();
                applyFilter();
            }
        });

        applyFilter();
    });
});
