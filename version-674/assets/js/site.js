(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var section = form.parentElement;
        var scope = section ? section.querySelector('[data-filter-scope]') : null;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')) : [];
        var search = form.querySelector('[data-filter-search]');
        var fields = Array.prototype.slice.call(form.querySelectorAll('[data-filter-field]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(search ? search.value : '');
            var selected = fields.map(function (field) {
                return {
                    name: field.getAttribute('data-filter-field'),
                    value: normalize(field.value)
                };
            });

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedFields = selected.every(function (item) {
                    if (!item.value) {
                        return true;
                    }
                    var cardValue = normalize(card.getAttribute('data-' + item.name));
                    return cardValue.indexOf(item.value) !== -1;
                });
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedFields));
            });
        }

        if (search) {
            search.addEventListener('input', apply);
        }

        fields.forEach(function (field) {
            field.addEventListener('change', apply);
        });
    });

    var hlsInstances = new WeakMap();

    function attachSource(video) {
        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }
        if (video.getAttribute('src')) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = hlsInstances.get(video);
            if (!hls) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hlsInstances.set(video, hls);
            }
            return;
        }
        video.src = source;
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');

        function play() {
            if (!video) {
                return;
            }
            attachSource(video);
            video.controls = true;
            player.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            play();
        });
    });
})();
