(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 360) {
          backTop.classList.add("is-visible");
        } else {
          backTop.classList.remove("is-visible");
        }
      });

      backTop.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startTimer();
        });
      });

      if (slides.length > 1) {
        startTimer();
      }
    }

    var searchInput = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (searchInput && cards.length) {
      var regionFilter = document.querySelector("[data-filter-region]");
      var typeFilter = document.querySelector("[data-filter-type]");
      var yearFilter = document.querySelector("[data-filter-year]");
      var feedback = document.querySelector("[data-search-feedback]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (initialQuery) {
        searchInput.value = initialQuery;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(searchInput.value);
        var region = regionFilter ? regionFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";
        var year = yearFilter ? yearFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search-text") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (feedback) {
          feedback.textContent = visible ? "已筛选出匹配影片，点击卡片可进入详情播放。" : "未找到匹配影片。";
        }
      }

      [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    }
  });
})();
