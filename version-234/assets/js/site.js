(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.addEventListener("error", function (event) {
    if (event.target && event.target.tagName === "IMG") {
      event.target.classList.add("image-empty");
    }
  }, true);

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterForm = document.querySelector("[data-filter-form]");

  if (filterForm) {
    var filterInput = filterForm.querySelector("[data-filter-input]");
    var typeSelect = filterForm.querySelector("[data-filter-select='type']");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : "";
      var visibleCount = 0;

      filterCards.forEach(function (card) {
        var bag = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        var typeText = (card.getAttribute("data-type") || "").toLowerCase();
        var matchedKeyword = !keyword || bag.indexOf(keyword) !== -1;
        var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1 || bag.indexOf(typeValue) !== -1;
        var matched = matchedKeyword && matchedType;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visibleCount ? "none" : "block";
      }
    }

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }
  }

  var searchForm = document.querySelector("[data-search-page]");

  if (searchForm && window.MOVIE_ITEMS) {
    var searchInput = searchForm.querySelector("[data-search-input]");
    var searchType = searchForm.querySelector("[data-search-type]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderMovieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\">" +
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"play-badge\">▶</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
        "<a class=\"movie-title\" href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }

    function runSearch() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var typeValue = searchType ? searchType.value.trim().toLowerCase() : "";
      var matched = window.MOVIE_ITEMS.filter(function (movie) {
        var bag = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        var typeText = String(movie.type || "").toLowerCase();
        return (!query || bag.indexOf(query) !== -1) && (!typeValue || typeText.indexOf(typeValue) !== -1 || bag.indexOf(typeValue) !== -1);
      }).slice(0, 80);

      if (results) {
        results.innerHTML = matched.map(renderMovieCard).join("");
      }

      if (summary) {
        summary.textContent = matched.length ? "搜索结果" : "没有找到匹配影片";
      }
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });

    if (searchInput) {
      searchInput.addEventListener("input", runSearch);
    }

    if (searchType) {
      searchType.addEventListener("change", runSearch);
    }

    if (initialQuery) {
      runSearch();
    }
  }
})();
