(function () {
  var navButton = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-arrow.prev');
    var next = carousel.querySelector('.hero-arrow.next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.searchable-list').forEach(function (list) {
    var scope = list.closest('main') || document;
    var searchInput = scope.querySelector('.card-search');
    var yearFilter = scope.querySelector('.year-filter');
    var categoryFilter = scope.querySelector('.category-filter');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var category = normalize(categoryFilter ? categoryFilter.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category')
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !year || normalize(card.getAttribute('data-year')) === year;
        var okCategory = !category || normalize(card.getAttribute('data-category')) === category;
        card.classList.toggle('is-hidden-card', !(okKeyword && okYear && okCategory));
      });
    }

    [searchInput, yearFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();

function setupVideoPlayer(videoId, buttonId, url) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var attached = false;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    attach();
    if (button) {
      button.classList.add('hidden');
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
