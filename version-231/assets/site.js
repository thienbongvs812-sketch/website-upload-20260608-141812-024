(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function bindSearchForms() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function bindHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var next = carousel.querySelector("[data-hero-next]");
        var prev = carousel.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindSearchPage() {
        var panel = document.querySelector("[data-search-page]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var year = panel.querySelector("[data-search-year]");
        var type = panel.querySelector("[data-search-type]");
        var genre = panel.querySelector("[data-search-genre]");
        var count = panel.querySelector("[data-search-count]");
        var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-search-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input && initial) {
            input.value = initial;
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedType = normalize(type ? type.value : "");
            var selectedGenre = normalize(genre ? genre.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search-text"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardGenre = normalize(card.getAttribute("data-genre"));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部影片";
            }
        }
        [input, year, type, genre].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function bindListFilter() {
        var panel = document.querySelector("[data-list-filter]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-filter-keyword]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var count = panel.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(panel.querySelectorAll(".listing-card"));

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedType = normalize(type ? type.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部影片";
            }
        }
        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        bindMenu();
        bindSearchForms();
        bindHero();
        bindSearchPage();
        bindListFilter();
    });
})();
