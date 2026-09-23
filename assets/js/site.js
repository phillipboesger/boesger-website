/* Bösger Digital — site interactions: sticky nav, mobile menu, reveal-on-scroll,
   tab bars (Profile / install commands), skill detail modal, media carousel. */
(function () {
  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  // Sticky header background
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu toggle
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Menü öffnen");
      });
    });
  }

  // Reveal-on-scroll
  var reveals = document.querySelectorAll("[data-reveal]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length && !reduceMotion) {
    var reveal = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { reveal.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Tab bars: any [data-tabs="group"] bar of [data-tab-target] buttons,
  // paired with [data-tabs-group="group"][data-tab-panel] panels.
  // A button may carry data-tab-hash="id" to make its panel deep-linkable via location.hash.
  document.querySelectorAll("[data-tabs]").forEach(function (bar) {
    var group = bar.getAttribute("data-tabs");
    var buttons = bar.querySelectorAll("[data-tab-target]");
    var panels = document.querySelectorAll('[data-tabs-group="' + group + '"]');

    function activate(target, syncHash) {
      buttons.forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-tab-target") === target);
      });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === target);
      });
      if (syncHash) {
        var btn = bar.querySelector('[data-tab-target="' + target + '"]');
        var hash = btn && btn.getAttribute("data-tab-hash");
        if (hash) history.replaceState(null, "", "#" + hash);
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        activate(b.getAttribute("data-tab-target"), true);
      });
    });

    if (location.hash) {
      var hashVal = location.hash.slice(1);
      var matched = null;
      buttons.forEach(function (b) {
        if (b.getAttribute("data-tab-hash") === hashVal) matched = b;
      });
      if (matched) activate(matched.getAttribute("data-tab-target"), false);
    }
  });

  // Skill detail modal (Profile → Skills): each [data-skill-modal] card holds a
  // hidden .skill-detail block; its content is cloned into the shared modal on click.
  var modal = document.getElementById("skill-modal");
  if (modal) {
    var modalIcon = modal.querySelector("[data-modal-icon]");
    var modalName = modal.querySelector("[data-modal-name]");
    var modalDesc = modal.querySelector("[data-modal-desc]");
    var modalDetail = modal.querySelector("[data-modal-detail]");

    function openModal(card) {
      var detail = card.querySelector(".skill-detail");
      if (!detail) return;
      var icon = detail.querySelector("[data-icon]");
      modalIcon.innerHTML = icon ? icon.innerHTML : "";
      modalName.textContent = detail.querySelector("[data-name]").textContent;
      modalDesc.textContent = detail.querySelector("[data-desc]").textContent;
      modalDetail.textContent = detail.querySelector("[data-detail]").textContent;
      modal.classList.add("is-open");
    }
    function closeModal() {
      modal.classList.remove("is-open");
    }

    document.querySelectorAll("[data-skill-modal]").forEach(function (card) {
      card.addEventListener("click", function () { openModal(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    modal.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  // Click-to-copy (Colors page): [data-copy="..."] copies the attribute value,
  // [data-copy-target="#sel"] copies that element's text. Synchronous
  // execCommand first — async clipboard writes can be interrupted — then the
  // async API as fallback. Feedback via a temporary .is-copied class.
  function copyText(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    if (!ok && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
  }

  document.querySelectorAll("[data-copy], [data-copy-target]").forEach(function (el) {
    el.addEventListener("click", function () {
      var target = el.getAttribute("data-copy-target");
      var text = target
        ? (document.querySelector(target) || {}).textContent || ""
        : el.getAttribute("data-copy") || "";
      if (!text) return;
      copyText(text.trim());
      var card = el.closest(".swatch-card") || el;
      card.classList.add("is-copied");
      clearTimeout(card._copyTimer);
      card._copyTimer = setTimeout(function () {
        card.classList.remove("is-copied");
      }, 1500);
    });
  });

  // Media carousel ("see it in action" screenshots/GIFs)
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = carousel.querySelectorAll(".carousel-slide");
    var dots = carousel.querySelectorAll(".carousel-dot");
    var captions = carousel.querySelectorAll(".carousel-caption-item");
    var prev = carousel.querySelector(".carousel-prev");
    var next = carousel.querySelector(".carousel-next");
    if (slides.length < 2) return;
    var idx = 0;
    slides.forEach(function (s, i) { if (s.classList.contains("is-active")) idx = i; });

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle("is-active", j === idx); });
      dots.forEach(function (d, j) { d.classList.toggle("is-active", j === idx); });
      captions.forEach(function (c, j) { c.classList.toggle("is-active", j === idx); });
    }
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { show(i); });
    });
    if (prev) prev.addEventListener("click", function () { show(idx - 1); });
    if (next) next.addEventListener("click", function () { show(idx + 1); });
  });
})();
