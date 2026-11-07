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
  /* R12d (07.11.): sperrt das Handy Videos (iOS-Stromsparmodus), laufen die Kapitel-Clips als animierte Bilder; sie laden schon,
     bevor die Karte ins Bild kommt, damit kein Standbild stehen bleibt */
  var gesperrt = false;
  var phoneK = window.matchMedia("(max-width: 860px)").matches;
  var kapBild = function (v) {
    if (v.__bild || !v.getAttribute("data-anim")) return;
    v.__bild = 1;
    var im = document.createElement("img");
    im.className = "mchap__anim"; im.alt = ""; im.setAttribute("aria-hidden", "true"); im.decoding = "async";
    im.src = v.getAttribute("data-anim");
    v.parentNode.appendChild(im);
  };
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        var v = e.target;
        if (v.closest(".making.is-built")) return;
        if (e.isIntersecting) {
          if (gesperrt && phoneK) { kapBild(v); return; }
          v.preload = "auto"; var p = v.play();
          if (p && p.catch) p.catch(function (er) { if (er && er.name === "NotAllowedError" && phoneK) { gesperrt = true; kapBild(v); } });
        } else v.pause();
      });
    }, { threshold: 0.4 });
    /* Vorlauf: ist die Sperre bekannt, lädt das Bild eine Bildschirmhöhe vor der Karte */
    var vor = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting && gesperrt && phoneK && !e.target.closest(".making.is-built")) kapBild(e.target); });
    }, { rootMargin: "100% 0px 100% 0px" });
    $$(".mchap__v").forEach(function (v) { io.observe(v); vor.observe(v); });
  }

  /* ===== Runde 8 ===== */
  /* R12c (07.11.): sperrt das Handy das Video (iOS-Stromsparmodus: play() wird abgelehnt), laeuft dieselbe Schleife als animiertes Bild */
  var phoneW = window.matchMedia("(max-width: 760px)").matches;
  var loopBild = function (v) {
    if (!phoneW || v.__bild || !v.getAttribute("data-anim")) return;
    v.__bild = 1;
    var im = document.createElement("img");
    im.className = "bannerloop"; im.alt = ""; im.setAttribute("aria-hidden", "true"); im.decoding = "async";
    im.addEventListener("load", function () { v.parentNode.classList.add("is-playing"); });
    im.src = v.getAttribute("data-anim");
    v.parentNode.appendChild(im);
  };
  var tryPlay = function (v) {
    var p = v.play();
    if (p && p.catch) p.catch(function (e) { if (e && e.name === "NotAllowedError") { gesperrt = true; loopBild(v); } });
  };
  var hv0 = $("#hero-video");
  if (hv0 && !reduce && phoneW && hv0.getAttribute("src")) {
    tryPlay(hv0);
    setTimeout(function () { if (hv0.paused && hv0.readyState >= 2) loopBild(hv0); }, 2500);
  }

  /* Hero: das Inline-Skript am Video startet es; Antippen startet es nachtraeglich (z. B. Stromsparmodus) */
  var hv = $("#hero-video"), hb = $("#hero-banner");
  if (hv && hb && !reduce) {
    var kick = function () { if (hv.paused && hv.getAttribute("src")) tryPlay(hv); };
    hb.addEventListener("touchend", kick, { passive: true });
    hb.addEventListener("click", kick);
  }

  /* R12 (07.11.): iPhone im Stromsparmodus startet Videos nicht von selbst - jede Beruehrung irgendwo startet sichtbare, angehaltene Banner-Videos */
  if (!reduce) {
    var wecken = function () {
      $$("#hero-video, .foot__banner video").forEach(function (v) {
        if (!v.paused || !v.getAttribute("src")) return;
        var r = v.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) tryPlay(v);
      });
    };
    document.addEventListener("touchend", wecken, { passive: true });
    document.addEventListener("click", wecken);
  }

  /* Fusszeilen-Banner: dieselbe Schleife wie oben, spielt nur solange sichtbar; Poster liegt darueber bis "playing" */
  var fv = $(".foot__banner video");
  if (fv && !reduce && "IntersectionObserver" in window) {
    var fb = fv.parentNode;
    fv.addEventListener("playing", function () { fb.classList.add("is-playing"); });
    new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) {
          if (!fv.getAttribute("src")) {
            var w = window.innerWidth * (window.devicePixelRatio || 1);
            fv.src = fv.getAttribute(window.matchMedia("(max-width: 760px)").matches ? (w > 800 ? "data-m2" : "data-m") : (w > 1700 ? "data-d2" : "data-d"));
          }
          fv.preload = "auto"; tryPlay(fv);
        } else fv.pause();
      });
    }, { threshold: 0.3 }).observe(fb);  /* R12 07.11.: Banner beobachten, nicht das Video (am Handy ist das Video vor dem Laden zu klein, 0.3 wurde nie erreicht) */
  }

  /* Discord-Kartenstapel: Antippen/Wischen = vordere Karte fliegt raus und legt sich nach hinten; nach der letzten wieder von vorn */
  var lb = $("#lbox"), lbImg = $("#lbox-img"), lbX = $("#lbox-x"), lbFrom = null;
  /* Runde 10: gefaecherter Stapel (Aussehen wie Runde 5/9). Klickverhalten nach Runde 4/5 (dort stellte sich die Karte unter der Maus
     gerade und wurde groesser): ein Klick/Tippen auf eine hintere Karte holt sie weich nach vorn, sie richtet sich gerade aus und
     waechst leicht, die anderen faechern sich dahinter neu auf. Ein Klick auf die vordere Karte hebt sie an und legt sie nach hinten.
     "Next" und Wischen tun dasselbe. Nach der letzten Karte geht es von vorn los. Nur transform. */
  var fan = $("#dfan");
  if (fan) {
    var cards = $$(".dwin", fan), n = cards.length, fi = $("#dfan-i"), busy = false;
    var order = cards.slice();                 /* order[0] = ganz hinten ... order[n-1] = vorn */
    var ROT = [-3, 1, 4, -1];
    var place = function () {
      var W = fan.clientWidth, mob = window.matchMedia("(max-width: 900px)").matches;
      var cw = cards[0].offsetWidth || W * 0.48, ch = cards[0].offsetHeight || cw * 1.35;
      var stepX = mob ? (W - cw) / Math.max(1, n - 1) : W * 0.26, stepY = mob ? 34 : fan.clientHeight * 0.10;
      if (mob) fan.style.height = Math.round(ch + stepY * (n - 1) + 20) + "px"; else fan.style.height = "";
      order.forEach(function (c, pos) {
        var front = pos === n - 1;
        c.style.setProperty("--x", Math.round(pos * stepX) + "px");
        c.style.setProperty("--y", Math.round((mob ? 0 : fan.clientHeight * 0.02) + pos * stepY) + "px");
        c.style.setProperty("--r", (front ? 0 : ROT[pos % ROT.length]) + "deg");
        c.style.setProperty("--s", front ? "1.06" : "1");
        c.style.setProperty("--z", String(1 + pos));
        c.classList.toggle("is-front", front);
        if (front) c.removeAttribute("aria-hidden"); else c.setAttribute("aria-hidden", "true");
      });
      if (fi) fi.textContent = String(cards.indexOf(order[n - 1]) + 1);
    };
    var bring = function (c) {                 /* R11: angeklickte Karte hebt sich gerade heraus und gleitet nach vorn */
      if (busy || c === order[n - 1]) return;
      busy = true; c.classList.add("is-pick");
      setTimeout(function () {
        order.splice(order.indexOf(c), 1); order.push(c); place();
        c.classList.remove("is-pick");
        setTimeout(function () { busy = false; }, reduce ? 0 : 350);
      }, reduce ? 0 : 240);
    };
    var sendBack = function () {               /* vordere Karte anheben und nach hinten legen */
      if (busy || n < 2) return;
      var c = order[n - 1]; busy = true;
      c.classList.add("is-lift");
      setTimeout(function () {
        c.classList.remove("is-lift");
        order.pop(); order.unshift(c); place();
        setTimeout(function () { busy = false; }, reduce ? 0 : 300);
      }, reduce ? 0 : 260);
    };
    var sx = 0, sy = 0, down = null, moved = false;
    fan.addEventListener("pointerdown", function (e) { var c = e.target.closest(".dwin"); if (!c) return; down = c; moved = false; sx = e.clientX; sy = e.clientY; });
    fan.addEventListener("pointermove", function (e) { if (down && Math.abs(e.clientX - sx) > 12 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) moved = true; });
    fan.addEventListener("pointerup", function () {
      if (!down) return; var c = down; down = null;
      if (moved || c === order[n - 1]) sendBack(); else bring(c);
    });
    fan.addEventListener("pointercancel", function () { down = null; });
    /* R11: ohne Knoepfe; mit der Tastatur blaettert Enter oder Leertaste auf dem Faecher weiter */
    fan.setAttribute("tabindex", "0");
    fan.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sendBack(); } });
    place();
    window.addEventListener("resize", place);
    window.addEventListener("load", place);
    cards.forEach(function (c) { var im = $("img", c); if (im && !im.complete) im.addEventListener("load", place, { once: true }); });
  }

  /* Runde 9 (Ladezeit): Poster der Videoschleifen erst kurz vor dem Sichtbereich laden */
  var pv = $$("video[data-poster]");
  if (pv.length) {
    var setP = function (v) { if (!v.getAttribute("poster")) v.setAttribute("poster", v.getAttribute("data-poster")); };
    if ("IntersectionObserver" in window) {
      var pio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { setP(e.target); pio.unobserve(e.target); } }); }, { rootMargin: "900px 0px" });
      pv.forEach(function (v) { pio.observe(v); });
    } else pv.forEach(setP);
  }
  if (lb && lbX) {
    var closeLb = function () { if (lb.hidden) return; lb.hidden = true; root.classList.remove("lbox-open"); if (lbFrom) lbFrom.focus(); };
    lbX.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lbox__in")) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb(); else if (e.key === "Tab") { e.preventDefault(); lbX.focus(); }
    });
  }
})();
