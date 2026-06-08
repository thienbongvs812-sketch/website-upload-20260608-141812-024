(function () {
  function initPlayer(panel) {
    var stream = panel.getAttribute("data-stream");
    var video = panel.querySelector("video");
    var button = panel.querySelector(".play-overlay");
    var hls = null;

    if (!stream || !video) {
      return;
    }

    function attachStream() {
      if (video.getAttribute("data-ready") === "true") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute("data-ready", "true");
    }

    function startPlay() {
      attachStream();

      if (button) {
        button.classList.add("is-hidden");
      }

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "true") {
        startPlay();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
})();
