(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(dotIndex);
        play();
      });
    });

    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    slider.addEventListener("mouseleave", function () {
      play();
    });

    play();
  }

  function initLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest("section") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var keywords = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-filtered-out", value && keywords.indexOf(value) === -1);
        });
      });
    });
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function makeMovieCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card searchable-card";
    article.setAttribute("data-keywords", [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category].join(" "));

    var poster = document.createElement("a");
    poster.className = "poster-link";
    poster.href = movie.url;

    var img = document.createElement("img");
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = "lazy";

    var badge = document.createElement("span");
    badge.className = "poster-badge";
    badge.textContent = movie.rating;

    var play = document.createElement("span");
    play.className = "poster-play";
    play.textContent = "▶";

    poster.appendChild(img);
    poster.appendChild(badge);
    poster.appendChild(play);

    var body = document.createElement("div");
    body.className = "card-body";

    var meta = document.createElement("div");
    meta.className = "card-meta";
    [movie.year, movie.region, movie.type].forEach(function (item) {
      var span = document.createElement("span");
      span.textContent = item;
      meta.appendChild(span);
    });

    var title = document.createElement("h3");
    var link = document.createElement("a");
    link.href = movie.url;
    link.textContent = movie.title;
    title.appendChild(link);

    var desc = document.createElement("p");
    desc.textContent = movie.desc;

    var tags = document.createElement("div");
    tags.className = "tag-row";
    movie.tags.slice(0, 3).forEach(function (tag) {
      var span = document.createElement("span");
      span.textContent = tag;
      tags.appendChild(span);
    });

    body.appendChild(meta);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(tags);
    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var heading = document.getElementById("search-heading");
    var input = document.getElementById("search-page-input");
    if (!results || !heading || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var query = getParam("q").trim();
    input.value = query;
    if (!query) {
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.desc, movie.tags.join(" ")].join(" ").toLowerCase();
      return terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
    }).slice(0, 120);
    results.innerHTML = "";
    heading.textContent = "搜索：" + query;
    if (!matched.length) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有找到相关影片，换一个关键词试试。";
      results.appendChild(empty);
      return;
    }
    matched.forEach(function (movie) {
      results.appendChild(makeMovieCard(movie));
    });
  }

  window.initMoviePlayer = function (source, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    var prepared = false;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    prepare();
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  ready(function () {
    initMenu();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
  });
})();
