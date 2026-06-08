(function () {
  const video = document.querySelector("[data-player]");
  const button = document.querySelector("[data-play-button]");
  const config = window.__CURRENT_VIDEO__ || {};
  let prepared = false;
  let hls = null;

  if (!video || !button || !config.source) {
    return;
  }

  function beginNativePlayback() {
    video.src = config.source;
    playVideo();
  }

  function beginHlsPlayback() {
    hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.attachMedia(video);
    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
      hls.loadSource(config.source);
      playVideo();
    });
    hls.on(window.Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
        hls = null;
        beginNativePlayback();
      }
    });
  }

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    video.controls = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      beginNativePlayback();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      beginHlsPlayback();
      return;
    }
    beginNativePlayback();
  }

  function playVideo() {
    button.classList.add("is-hidden");
    const request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", function () {
    prepare();
  });

  video.addEventListener("click", function () {
    if (!prepared || video.paused) {
      prepare();
    } else {
      video.pause();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
