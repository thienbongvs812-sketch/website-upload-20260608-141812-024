(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], [data-search-input]");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function initCardFilters() {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var search = document.querySelector("[data-card-search]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(" ").toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || card.dataset.year === yearValue;
        var matchedRegion = !regionValue || card.dataset.region === regionValue;
        card.classList.toggle("hidden-card", !(matchedKeyword && matchedYear && matchedRegion));
      });
    }

    [search, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"./" + movie.file + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"card-year\">" + escapeHtml(movie.year) + "</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "<h2><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p>" + escapeHtml(movie.one_line) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var keyword = document.querySelector("[data-search-keyword]");
    var fallback = document.querySelector("[data-search-fallback]");
    if (input) {
      input.value = query;
    }
    var movies = window.SEARCH_MOVIES;
    var matched = movies;
    if (query) {
      var lower = query.toLowerCase();
      matched = movies.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.one_line, (movie.tags || []).join(" ")]
          .join(" ")
          .toLowerCase()
          .indexOf(lower) !== -1;
      });
    } else {
      matched = movies.slice(0, 24);
    }
    if (title) {
      title.textContent = query ? "搜索结果" : "推荐影片";
    }
    if (keyword) {
      keyword.textContent = query ? "关键词：" + query : "可通过顶部搜索框查找更多内容。";
    }
    if (fallback) {
      fallback.style.display = query ? "none" : "grid";
    }
    results.innerHTML = matched.slice(0, 120).map(movieCard).join("");
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var source = shell.getAttribute("data-video");
    var loaded = false;
    var hlsInstance = null;

    function loadAndPlay() {
      if (!video || !source) {
        return;
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayer();
  });
})();
