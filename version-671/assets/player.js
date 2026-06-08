(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-play-button]");

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute("data-hls") || "";
    var hlsInstance = null;
    var loaded = false;

    function hideButton() {
      button.classList.add("is-hidden");
    }

    function showButton(text) {
      button.classList.remove("is-hidden");
      var label = button.querySelector("strong");
      if (label && text) {
        label.textContent = text;
      }
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          showButton("点击播放");
        });
      }
    }

    function loadVideo() {
      if (!source) {
        showButton("播放暂时不可用");
        return;
      }

      hideButton();

      if (loaded) {
        playVideo();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.load();
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 45,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showButton("重新播放");
          }
        });
        return;
      }

      video.src = source;
      video.load();
      playVideo();
    }

    button.addEventListener("click", loadVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        loadVideo();
      }
    });
    video.addEventListener("play", hideButton);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showButton("继续播放");
      }
    });
    video.addEventListener("ended", function () {
      showButton("重新播放");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
