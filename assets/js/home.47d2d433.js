/* palmmile.com — Bewegung mit GSAP 3.15.0, ScrollTrigger, SplitText, Lenis 1.3.27 (alle selbst gehostet).
   Volle Fassung: Zeilen aus einer Maske, gestaffelte Karten, Zaehler, Parallax, Neigung, Laufband, Smooth Scroll.
   Sanfte Fassung (Systemeinstellung "weniger Bewegung"): nur Einblenden ohne Weg, Zaehler; kein Parallax, kein Smooth Scroll.
   Ohne diese Datei ist alles sichtbar; die Endzahlen stehen im HTML. */
(function () {
  "use strict";
  var root = document.documentElement;
  var fm = root.classList.contains("fm");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !fm;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("anim"); root.classList.remove("anim-soft");
    return;
  }
  window.__animOk = true;
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = !!window.SplitText;
  if (hasSplit) gsap.registerPlugin(SplitText);
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var navH = ($("#nav") || {}).offsetHeight || 68;
  var EASE = "power3.out";
  /* R12 (07.11.): Handy - Text oben sofort (CSS), Einblendungen frueher und schneller, Kapitel-Aufbau auch am Handy */
  var phone = window.matchMedia("(max-width: 760px)").matches;

  function counters(dur) {
    $$(".count").forEach(function (el) {
      var to = parseFloat(el.getAttribute("data-to"));
      if (isNaN(to)) return;
      var o = { v: 0 };
      el.textContent = "0";
      ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () {
          gsap.to(o, { v: to, duration: dur, ease: EASE,
            onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString("en-US"); },
            onComplete: function () { el.textContent = to.toLocaleString("en-US"); } });
        }
      });
    });
  }

  /* Farbuebergaenge: die Tonflaeche hinter allem nimmt den Ton des Abschnitts an (Farbe, keine Bewegung) */
  function tones(dur) {
    var tone = $(".tone");
    if (!tone) return;
    $$("[data-tone]").forEach(function (sec) {
      var col = sec.getAttribute("data-tone");
      ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%",
        onToggle: function (self) { if (self.isActive) gsap.to(tone, { backgroundColor: col, duration: dur, ease: "power2.out", overwrite: true }); } });
    });
  }

  /* So entsteht ein Video (Ablauf wie Runde 3): Buehne steht (sticky), die Kapitel laufen rechts durch.
     Jedes erreichte Kapitel wischt sein Video ueber die vorigen; die Kapitelleiste fuellt sich mit. */
  function making(full) {
    var sec = $(".making"), chaps = $$(".mchap");
    if (!sec || !chaps.length || !full || !window.matchMedia("(min-width: 1000px)").matches) return;
    sec.classList.add("is-built");
    var vids = $$(".mframe__v"), tl = $$(".mtl li"), cur = -1, live = false;
    var play = function (v) { v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var set = function (i) {
      if (i === cur) return; cur = i;
      chaps.forEach(function (c, k) { c.classList.toggle("is-on", k === i); });
      tl.forEach(function (c, k) { c.classList.toggle("is-on", k === i); if (k < i) c.style.setProperty("--p", 1); if (k > i) c.style.setProperty("--p", 0); });
      vids.forEach(function (v, k) { v.classList.toggle("is-shown", k <= i); if (k === i && live) play(v); else v.pause(); });
    };
    chaps.forEach(function (c, i) {
      ScrollTrigger.create({ trigger: c, start: "top 62%", end: "bottom 62%",
        onToggle: function (self) { if (self.isActive) set(i); },
        onUpdate: function (self) { if (tl[i]) tl[i].style.setProperty("--p", self.progress.toFixed(3)); } });
    });
    ScrollTrigger.create({ trigger: sec, start: "top 80%", end: "bottom 20%",
      onToggle: function (self) { live = self.isActive; var v = vids[cur]; if (v) { if (live) play(v); else v.pause(); } } });
    set(0);
  }

  /* R12c (07.11.): Handy - die vier Schritte bauen sich nach unten auf: Linie zeichnet sich mit, jede Karte gleitet herein, ihr Punkt leuchtet */
  function makingPhone() {
    var list = $(".mtext"), chaps = $$(".mchap");
    if (!list || !chaps.length || !window.matchMedia("(max-width: 859px)").matches) return;
    var line = document.createElement("span"); line.className = "mline"; line.setAttribute("aria-hidden", "true"); list.appendChild(line);
    gsap.to(line, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 72%", end: "bottom 72%", scrub: 0.3 } });
    chaps.forEach(function (c) {
      gsap.to(c, { opacity: 1, x: 0, duration: 0.55, ease: EASE, scrollTrigger: { trigger: c, start: "top 88%", once: true } });
      ScrollTrigger.create({ trigger: c, start: "top 72%", onEnter: function () { c.classList.add("is-lit"); }, onLeaveBack: function () { c.classList.remove("is-lit"); } });
    });
  }

  /* ---------------- Sanfte Fassung ---------------- */
  function soft() {
    $$(".split").forEach(function (h) { gsap.set(h, { visibility: "visible" }); });
    gsap.to($$("[data-hero]"), { opacity: 1, duration: 0.8, stagger: 0.08, ease: "none" });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 92%", once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, duration: 0.7, stagger: Math.min(0.05, 0.4 / Math.max(1, batch.length)), ease: "none", overwrite: "auto" }); }
    });
    counters(1.0);
    tones(0.8);
    ScrollTrigger.refresh();
  }

  /* ---------------- Volle Fassung ---------------- */
  function full() {
    if (phone) gsap.globalTimeline.timeScale(1.7);
    if (window.Lenis) {
      var lenis = new Lenis({ anchors: { offset: -navH }, lerp: 0.1 });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    var hero = $(".hero");
    if (hero) {
      /* Banner: faehrt beim Laden von 112 % auf 100 % (nur transform, die Deckkraft bleibt 1 fuer einen schnellen ersten Eindruck) */
      var media = $$(".hero__banner img, .hero__banner video");
      gsap.from(media, { scale: 1.12, duration: 2.2, ease: "power2.out" });
      /* Parallax: Banner laeuft beim Scrollen langsamer als der Inhalt */
      gsap.to(media, { yPercent: 18, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__ground", { y: -40, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      if (!phone) gsap.to($$("[data-hero]", hero), { opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.55, ease: EASE });
    }

    /* Runde 10: das farbige Wort laedt sich von links auf, dann laeuft einmal ein Lichtschimmer durch */
    var hl = function (h) {
      $$("em.hl", h).forEach(function (em) {
        gsap.fromTo(em, { clipPath: "inset(-10% 100% -10% 0%)" }, { clipPath: "inset(-10% 0% -10% 0%)", duration: 0.9, delay: 0.35, ease: "power2.inOut" });
        /* (Lichtschimmer verworfen: erschien als heller Kasten ueber dem Wort) */
      });
    };
    /* Ueberschriften: Zeile fuer Zeile aus einer Maske (Hero beim Laden, sonst beim Scrollen) */
    $$(".split").forEach(function (h) {
      if (!hasSplit) { gsap.set(h, { visibility: "visible" }); return; }
      var inHero = !!h.closest(".hero");
      if (inHero && phone) { gsap.set(h, { visibility: "visible" }); return; }
      SplitText.create(h, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit: function (self) {
          gsap.set(h, { visibility: "visible" });
          return gsap.from(self.lines, inHero
            ? { yPercent: 115, duration: 1.1, stagger: 0.12, ease: EASE, delay: 0.25 }
            : { yPercent: 115, duration: 1, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: h, start: "top 88%", once: true,
                onEnter: function () { hl(h); } } });
        }
      });
    });

    /* Runde 10: jeder Abschnitt baut sich sichtbar auf. Karten: Karte erscheint, ihr Rahmen zeichnet sich als Linie (CSS, clip-path),
       dann gleitet der Inhalt gestaffelt hoch. Besondere Gruppen: Rewards-Wege fahren von links ein, FAQ-Zeilen gleiten von links,
       Zahlen-Kaestchen laden einen Balken, Credit-Karten blenden die Namen nacheinander ein, Leaderboard-Balken wachsen auf ihren Wert.
       Was beim Sprung schon ueber dem Bildschirm liegt, steht sofort (Fehler aus R9). Nur transform, opacity, clip-path. */
    var isCard = function (el) { return el.classList.contains("neon"); };
    var showNow = function (el) {
      gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1 }); el.classList.add("is-draw");
      gsap.set($$(".roleicon, .stat__load, .mf__bar i, .ccard__names li, .ccard__media img", el), { clearProps: "transform,opacity" });
      gsap.set(el.children, { clearProps: "transform,opacity" });
    };
    var build = function (el, d) {
      if (el.matches("details")) { gsap.fromTo(el, { opacity: 0, x: -48, y: 0 }, { opacity: 1, x: 0, duration: 0.7, delay: d, ease: EASE }); return; }
      if (!isCard(el)) { gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.9, delay: d, ease: EASE, overwrite: "auto" }); return; }
      var fromLeft = !!el.closest(".earn");
      gsap.fromTo(el, fromLeft ? { opacity: 0, x: -70, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.7, delay: d, ease: EASE, overwrite: "auto" });
      setTimeout(function () { el.classList.add("is-draw"); }, d * 1000 + 120);
      var kids = Array.prototype.slice.call(el.children).filter(function (k) {
        return !k.classList.contains("step__glow") && !k.classList.contains("ccard__media") && !k.classList.contains("stat__load"); });
      gsap.fromTo(kids, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: d + 0.35, ease: EASE });
      var med = $(".ccard__media img", el);
      if (med) gsap.fromTo(med, { opacity: 0.3, scale: 1.15 }, { opacity: 1, scale: 1, duration: 1.1, delay: d + 0.1, ease: EASE });
      var names = $$(".ccard__names li", el);
      if (names.length) gsap.fromTo(names, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.14, delay: d + 0.7, ease: EASE });
      var load = $(".stat__load", el);
      if (load) gsap.fromTo(load, { scaleX: 0 }, { scaleX: 1, duration: 1.2, delay: d + 0.25, ease: "power2.out" });
      var bars = $$(".mf__bar i", el);
      if (bars.length) gsap.from(bars, { scaleX: 0, duration: 1.1, stagger: 0.12, delay: d + 0.5, ease: "power3.out" });
      var ic = $$(".roleicon", el);
      if (ic.length) gsap.to(ic, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.12, delay: d + 0.6, ease: "back.out(2.2)" });
    };
    /* Zahlen-Kaestchen: duenner Ladebalken unter jeder Zahl */
    $$(".stat").forEach(function (st) { if (!$(".stat__load", st)) { var b = document.createElement("span"); b.className = "stat__load"; b.setAttribute("aria-hidden", "true"); st.appendChild(b); } });
    ScrollTrigger.batch("[data-reveal]", {
      start: phone ? "top 102%" : "top 90%", once: true,
      onEnter: function (batch) {
        var above = batch.filter(function (el) { return el.getBoundingClientRect().bottom < 0; });
        var now = batch.filter(function (el) { return above.indexOf(el) < 0; });
        above.forEach(showNow);
        var step = Math.min(0.14, 0.7 / Math.max(1, now.length));
        now.forEach(function (el, i) { build(el, i * step); });
      }
    });
    /* Sicherheitsnetz: nichts bleibt unsichtbar haengen (nach 2 s im Bild wird alles gezeigt) */
    setInterval(function () {
      $$("[data-reveal]").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0 && +getComputedStyle(el).opacity < 0.05 && !el.__late)
          el.__late = setTimeout(function () { el.__late = 0; if (+getComputedStyle(el).opacity < 0.05) showNow(el); }, 2000);
      });
    }, 1000);

    /* Three steps (R11): keine Ladelinie mehr; jede Karte leuchtet einmal auf, wenn sie ins Bild kommt */
    $$(".steps .step").forEach(function (st) {
      if (!$(".step__glow", st)) { var g = document.createElement("span"); g.className = "step__glow"; g.setAttribute("aria-hidden", "true"); st.insertBefore(g, st.firstChild); }
      ScrollTrigger.create({ trigger: st, start: "top 75%", once: true, onEnter: function () { setTimeout(function () { st.classList.add("is-lit"); }, 500); } });
    });

    /* Rewards (R11): das Leaderboard-Bild blendet ein wie die anderen Karten (kein Scan mehr) */

    /* Videokarten: Thumbnails hellen auf und zoomen leicht ein (dazu die Bildmaske von unten, R5) */
    $$(".vcard__media img").forEach(function (im) {
      gsap.fromTo(im, { opacity: 0.35, scale: 1.18 }, { opacity: 1, scale: 1, duration: 1.4, ease: EASE, scrollTrigger: { trigger: im, start: "top 90%", once: true } });
    });

    /* R11: Fusszeilen-Banner wieder genau wie Runde 9 (die R10-Parallaxe vergroesserte und verschob den Ausschnitt) */

    /* Runde 9: echte Bilder hellen beim Hineinscrollen auf (40 % -> 100 %, 108 % -> 100 %) */
    $$(".mchap__fig").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0.4, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });

    counters(1.2);   /* Runde 9: Zaehler 1,2 s */
    tones(1.4);
    making(true);
    makingPhone();

    /* Bild-Masken: Thumbnails, Discord-Fenster und Schlussflaeche werden von unten aufgedeckt */
    $$(".vcard__media, .wipe").forEach(function (el) {
      gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.inOut",
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });

    /* Laufband: die Scrollgeschwindigkeit beschleunigt es kurz */
    var track = $(".marquee__track");
    if (track && track.getAnimations) {
      var anim = track.getAnimations()[0];
      if (anim) {
        var st = ScrollTrigger.create({ start: 0, end: "max" });
        var rate = 1;
        gsap.ticker.add(function () {
          var target = 1 + Math.min(Math.abs(st.getVelocity()) / 300, 8);
          rate += (target - rate) * 0.08;
          anim.updatePlaybackRate(rate);
        });
      }
    }

    /* Ziffern 01/02/03 fuellen sich beim Scrollen (einfarbig) */
    $$(".step__num").forEach(function (num) {
      gsap.fromTo(num, { "--fill": "0%" }, { "--fill": "100%", ease: "none", scrollTrigger: { trigger: num, start: "top 88%", end: "top 45%", scrub: 0.6 } });
    });

    /* Discord-Stapel: Runde 9 setzt die Lage der Karten in site.js (transform); der Stapel erscheint als Ganzes mit [data-reveal] */
    /* (Parallax per data-speed, falls genutzt) */
    $$("[data-speed]").forEach(function (el) {
      var sp = parseFloat(el.getAttribute("data-speed")) || 0;
      gsap.fromTo(el, { y: -sp * 600 }, { y: sp * 600, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* Videokarten: Neigung zur Maus (nur Desktop) */
    if (fine) {
      $$(".vcard, .social").forEach(function (c) {
        var rx = gsap.quickTo(c, "rotationX", { duration: 0.6, ease: EASE });
        var ry = gsap.quickTo(c, "rotationY", { duration: 0.6, ease: EASE });
        gsap.set(c, { transformPerspective: 900 });
        c.addEventListener("pointermove", function (e) {
          var r = c.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        c.addEventListener("pointerleave", function () { rx(0); ry(0); });
      });
    }
    ScrollTrigger.refresh();
    /* Runde 9: nachgeladene Bilder verschieben die Seite; Ausloeser danach neu messen, damit nichts unsichtbar bleibt */
    var rt = 0, again = function () { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 150); };
    $$("img[loading=lazy]").forEach(function (im) { if (!im.complete) im.addEventListener("load", again, { once: true }); });
    window.addEventListener("load", again);
  }

  var go = function () {
    try { if (reduce) soft(); else full(); }
    catch (e) { root.classList.remove("anim"); root.classList.remove("anim-soft"); if (window.console) console.error(e); }
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
})();
