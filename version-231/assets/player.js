import { H as Hls } from "./hls-DrU42sTK.js";

export function initMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var state = document.querySelector("[data-player-state]");
    var prepared = false;
    var hls = null;

    if (!video || !overlay || !source) {
        return;
    }

    function setState(text) {
        if (state) {
            state.textContent = text || "";
        }
    }

    function prepare() {
        if (prepared) {
            return;
        }
        prepared = true;
        setState("加载中…");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                setState("");
            }, { once: true });
            return;
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setState("");
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setState("正在重新连接…");
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setState("正在恢复播放…");
                    hls.recoverMediaError();
                } else {
                    setState("播放遇到问题");
                    hls.destroy();
                }
            });
            return;
        }
        video.src = source;
    }

    function start() {
        overlay.classList.add("is-hidden");
        video.controls = true;
        prepare();
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
            playRequest.catch(function () {
                overlay.classList.remove("is-hidden");
                setState("");
            });
        }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!prepared || video.paused) {
            start();
        }
    });
    video.addEventListener("playing", function () {
        setState("");
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
