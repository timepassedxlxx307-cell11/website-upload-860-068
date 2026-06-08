(function () {
    function init(videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hls = null;

        if (!video || !overlay || !source) {
            return;
        }

        function load() {
            if (video.getAttribute('data-ready') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', 'true');
            video.setAttribute('controls', 'controls');
        }

        function play() {
            load();
            overlay.classList.add('is-hidden');
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.SitePlayer = {
        init: init
    };
})();
