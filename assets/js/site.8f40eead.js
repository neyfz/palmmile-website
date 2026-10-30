/* palmmile.com — gemeinsame Funktionen: Kopfleiste, Mega-Menue, Drawer, Dock, Nach-oben, Karten-Karussell,
   Lichtflecken folgen der Maus. Ohne Bibliotheken, ohne Speicherzugriff (kein Cookie, kein localStorage). */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !document.documentElement.classList.contains("fm");
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var top = $("#top-ui"), nav = $("#nav");

  /* ---------- Banner-Video: erst nach dem Laden der Seite starten (schneller erster Eindruck), nie bei weniger Bewegung ---------- */
  var bv = $("video[data-autoplay]");
  if (bv && !reduce) {
    var startVideo = function () {
      bv.preload = "auto";
      var pr = bv.play();
      if (pr && pr.catch) pr.catch(function () {});
    };
    if (document.readyState === "complete") startVideo(); else window.addEventListener("load", startVideo);
  }

  /* ---------- Kopfleiste: Ankuendigung rollt weg, Header wird dunkel ---------- */
  var heroEnd = $("#hero-end");
  function onScroll() {
    var y = window.pageYOffset || 0;
    if (top) top.classList.toggle("is-scrolled", y > 24);
    if (nav && nav.classList.contains("nav--clear")) nav.classList.toggle("is-solid", y > 40);
    var tt = $("#totop");
    if (tt) tt.classList.toggle("is-on", y > window.innerHeight * 1.2);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Mega-Menue "Videos" ---------- */
  var mega = $("#mega"), megaBtn = $("#mega-btn");
  var megaTimer = 0;
  function openMega(open) {
    if (!mega || !megaBtn) return;
    clearTimeout(megaTimer);
    if (open) {
      mega.hidden = false;
      void mega.offsetWidth;
      mega.classList.add("is-open");
    } else {
      mega.classList.remove("is-open");
      megaTimer = setTimeout(function () { mega.hidden = true; }, 380);
    }
    megaBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (nav) nav.classList.toggle("mega-open", open);
  }
  if (mega && megaBtn) {
    var holder = megaBtn.closest("li");
    var scope = nav;
    megaBtn.addEventListener("click", function () { openMega(megaBtn.getAttribute("aria-expanded") !== "true"); });
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) {
      var closeT = 0;
      var enter = function () { clearTimeout(closeT); openMega(true); };
      var leave = function () { closeT = setTimeout(function () { openMega(false); }, 180); };
      [holder, mega].forEach(function (el) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && megaBtn.getAttribute("aria-expanded") === "true") { openMega(false); megaBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (megaBtn.getAttribute("aria-expanded") === "true" && !scope.contains(e.target)) openMega(false);
    });
    scope.addEventListener("focusout", function (e) {
      if (megaBtn.getAttribute("aria-expanded") === "true" && e.relatedTarget && !scope.contains(e.relatedTarget)) openMega(false);
    });
    mega.addEventListener("click", function (e) { if (e.target.closest("a")) openMega(false); });
  }

  /* ---------- Drawer (Handy) ---------- */
  var burger = $("#menu-toggle"), drawer = $("#drawer");
  var drawerTimer = 0;
  function setDrawer(open) {
    if (!burger || !drawer) return;
    clearTimeout(drawerTimer);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      drawer.hidden = false;
      $$("img[loading=lazy]", drawer).forEach(function (i) { i.loading = "eager"; });
      void drawer.offsetWidth;
      drawer.classList.add("is-open");
      root.classList.add("menu-open");
      var first = $("a", drawer); if (first) first.focus({ preventScroll: true });
    } else {
      drawer.classList.remove("is-open");
      root.classList.remove("menu-open");
      drawerTimer = setTimeout(function () { drawer.hidden = true; }, 450);
    }
  }
  if (burger && drawer) {
    burger.addEventListener("click", function () { setDrawer(burger.getAttribute("aria-expanded") !== "true"); });
    drawer.addEventListener("click", function (e) { if (e.target.closest("a")) setDrawer(false); });
    document.addEventListener("keydown", function (e) {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") { setDrawer(false); burger.focus(); return; }
      if (e.key === "Tab") {
        var f = $$("a,button", drawer).concat([burger]).filter(function (el) { return el.offsetParent !== null || el === burger; });
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    var mq = window.matchMedia("(min-width: 981px)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (mq.matches) setDrawer(false); });
  }

  /* ---------- Dock (Handy): auf der Startseite erst nach dem Hero ---------- */
  var dock = $("#dock"), closing = $("#closing");
  if (dock) {
    if (!heroEnd || !("IntersectionObserver" in window)) dock.classList.add("is-on");
    else {
      var gone = false, seen = false;
      var upd = function () { dock.classList.toggle("is-on", gone && !seen); };
      new IntersectionObserver(function (en) { gone = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; upd(); }).observe(heroEnd);
      if (closing) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; upd(); }, { threshold: 0.25 }).observe(closing);
    }
  }

  /* ---------- Nach oben ---------- */
  var tt = $("#totop");
  if (tt) tt.addEventListener("click", function () {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- Karten-Karussell (Handy): Fortschrittsbalken + Punkte ---------- */
  var track = $("#vcards"), bar = $("#vprog-bar"), dots = $$("#vprog-dots button");
  if (track && bar) {
    var cards = $$(".vcard", track);
    var prog = function () {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 0;
      var w = track.scrollWidth ? Math.min(1, track.clientWidth / track.scrollWidth) : 1;
      bar.style.setProperty("--p", (w + (1 - w) * p).toFixed(3));
      var cur = 0, best = 1e9, mid = track.scrollLeft + track.clientWidth / 2;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < best) { best = d; cur = i; } });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === cur ? "true" : "false"); });
    };
    track.addEventListener("scroll", function () { requestAnimationFrame(prog); }, { passive: true });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        var c = cards[i]; if (!c) return;
        track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
      });
    });
    window.addEventListener("resize", prog);
    prog();
  }

  /* ---------- Lichtflecken folgen der Maus (nur Desktop, nicht bei weniger Bewegung) ---------- */
  var fineMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!reduce && fineMouse) {
    var fxm = $$(".fx__m"), tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    var loop = function () {
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      fxm.forEach(function (el, i) { var k = (i + 1) * 28; el.style.transform = "translate3d(" + (cx * k).toFixed(1) + "px," + (cy * k).toFixed(1) + "px,0)"; });
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

  }

  /* ---------- Videoschleifen (How a video is made, Listenform): spielen nur, solange sie sichtbar sind ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var v = e.target;
        if (v.closest(".making.is-built")) return;
        if (e.isIntersecting) { v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.4 });
    $$(".mchap__v").forEach(function (v) { io.observe(v); });
  }
})();
