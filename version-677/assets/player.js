(function () {
  window.initMoviePlayer = function (playbackUrl) {
    var player = document.querySelector("[data-player]");

    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var hls = null;
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playbackUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = playbackUrl;
    }

    function play() {
      prepare();

      if (layer) {
        layer.classList.add("is-hidden");
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
}());
