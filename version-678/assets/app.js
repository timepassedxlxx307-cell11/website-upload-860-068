(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
            button.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function setupFilters() {
        var source = document.querySelector('[data-filter-source]');
        var panel = document.querySelector('[data-filter-panel]');
        if (!source || !panel) {
            return;
        }
        var field = panel.querySelector('[data-search-field]');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
        var clear = panel.querySelector('[data-filter-clear]');
        var cards = Array.prototype.slice.call(source.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-result]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (field && query) {
            field.value = query;
        }

        function matches(card, term, filters) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category')
            ].join(' '));
            if (term && text.indexOf(term) === -1) {
                return false;
            }
            return filters.every(function (filter) {
                if (!filter.value) {
                    return true;
                }
                var data = normalize(card.getAttribute('data-' + filter.key));
                return data.indexOf(filter.value) !== -1;
            });
        }

        function apply() {
            var term = normalize(field ? field.value : '');
            var filters = selects.map(function (select) {
                return {
                    key: select.getAttribute('data-filter-select'),
                    value: normalize(select.value)
                };
            });
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card, term, filters);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (field) {
            field.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (clear) {
            clear.addEventListener('click', function () {
                if (field) {
                    field.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });

    window.initMoviePlayer = function (url) {
        ready(function () {
            var video = document.querySelector('[data-player-video]');
            var overlay = document.querySelector('[data-player-overlay]');
            var trigger = document.querySelector('[data-player-trigger]');
            if (!video || !overlay) {
                return;
            }
            var attached = false;
            var hls = null;

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function play() {
                attach();
                overlay.classList.add('hidden');
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            overlay.addEventListener('click', play);
            if (trigger) {
                trigger.addEventListener('click', function (event) {
                    event.stopPropagation();
                    play();
                });
            }
            video.addEventListener('click', function () {
                if (!attached) {
                    play();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };
})();
