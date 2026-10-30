/* Credit-Seiten: Suchfeld als Zusatz. Ohne JavaScript steht die ganze Liste da. */
(function () {
  "use strict";
  var box = document.getElementById("search");
  var input = document.getElementById("q");
  var out = document.getElementById("qcount");
  var rows = Array.prototype.slice.call(document.querySelectorAll("#ctable tbody tr"));
  if (!box || !input || !rows.length) return;
  box.hidden = false;
  var haystack = rows.map(function (r) { return r.textContent.toLowerCase().replace(/\s+/g, " "); });
  var timer = 0;
  function run() {
    var q = input.value.trim().toLowerCase();
    var n = 0;
    for (var i = 0; i < rows.length; i++) {
      var hit = !q || haystack[i].indexOf(q) !== -1;
      rows[i].hidden = !hit;
      if (hit) n++;
    }
    out.textContent = q ? (n === 0 ? "No match." : n + (n === 1 ? " match" : " matches")) : "";
  }
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(run, 80);
  });
})();
