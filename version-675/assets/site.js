(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function setHero(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setHero(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        setHero(0);
        startHero();
    }

    document.querySelectorAll('[data-filter-box]').forEach(function (box) {
        var input = box.querySelector('[data-filter-input]');
        var yearSelect = box.querySelector('[data-filter-year]');
        var categorySelect = box.querySelector('[data-filter-category]');
        var list = document.querySelector('[data-card-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var category = normalize(categorySelect ? categorySelect.value : '');

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var visible = true;

                if (query && text.indexOf(query) === -1) {
                    visible = false;
                }
                if (year && cardYear.indexOf(year) === -1) {
                    visible = false;
                }
                if (category && cardCategory !== category) {
                    visible = false;
                }

                card.classList.toggle('is-hidden-card', !visible);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilter);
        }
        applyFilter();
    });
})();
