(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function textOf(card) {
        return [
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.type,
            card.dataset.category,
            card.textContent
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var search = document.querySelector('[data-card-search]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var count = document.querySelector('[data-result-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        if (!cards.length) {
            return;
        }

        function applyFilters() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var type = typeFilter ? typeFilter.value : '';
            var minYear = yearFilter && yearFilter.value ? parseInt(yearFilter.value, 10) : 0;
            var visible = 0;

            cards.forEach(function (card) {
                var cardYear = parseInt(card.dataset.year || '0', 10) || 0;
                var matchQuery = !query || textOf(card).indexOf(query) !== -1;
                var matchType = !type || (card.dataset.type || '').indexOf(type) !== -1 || textOf(card).indexOf(type.toLowerCase()) !== -1;
                var matchYear = !minYear || cardYear >= minYear;
                var show = matchQuery && matchType && matchYear;

                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 条内容';
            }
        }

        [search, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && search) {
            search.value = query;
        }
        applyFilters();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));
        players.forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var button = wrap.querySelector('[data-player-start]');
            var source = wrap.dataset.videoUrl;

            if (!video || !button || !source) {
                return;
            }

            function playVideo() {
                button.classList.add('is-hidden');

                if (window.Hls && window.Hls.isSupported()) {
                    if (video.__hlsInstance) {
                        video.__hlsInstance.destroy();
                    }
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    video.__hlsInstance = hls;
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            button.classList.remove('is-hidden');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            button.classList.remove('is-hidden');
                        }
                    });
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {
                        button.classList.remove('is-hidden');
                    });
                    return;
                }

                video.src = source;
                video.play().catch(function () {
                    button.classList.remove('is-hidden');
                });
            }

            button.addEventListener('click', playVideo);
        });
    }

    ready(function () {
        initMenu();
        initFilters();
        initPlayers();
    });
})();
