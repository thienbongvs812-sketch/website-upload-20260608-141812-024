(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });
            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }
            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter-input]").forEach(function (input) {
            var scope = input.closest("section") || document;
            var list = scope.querySelector("[data-filter-list]") || document;
            var items = Array.prototype.slice.call(list.querySelectorAll("[data-filter-item]"));
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                items.forEach(function (item) {
                    var text = item.getAttribute("data-index") || item.textContent.toLowerCase();
                    item.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
                });
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
                input.dispatchEvent(new Event("input"));
            }
        });

        document.querySelectorAll("[data-player]").forEach(function (card) {
            var video = card.querySelector("video");
            var button = card.querySelector("[data-play-button]");
            var stream = card.getAttribute("data-stream-url");

            function attachStream() {
                if (!video || !stream || video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = stream;
                }
                video.setAttribute("data-ready", "1");
            }

            function play() {
                attachStream();
                card.classList.add("is-playing");
                if (video) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {
                            card.classList.remove("is-playing");
                        });
                    }
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    card.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (!video.currentTime) {
                        card.classList.remove("is-playing");
                    }
                });
            }
        });
    });
})();
