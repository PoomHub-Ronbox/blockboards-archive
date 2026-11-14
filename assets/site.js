// LACUNA archive site. No tracking, no requests: everything personal comes from the URL fragment
// (#v=<vessel>&u=<name>, never sent to the server) or from local.js when the mod opens the offline copy.
(function () {
  "use strict";

  function fromHash() {
    var out = {};
    location.hash.replace(/^#/, "").split("&").forEach(function (pair) {
      var i = pair.indexOf("=");
      if (i > 0) {
        try { out[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1)); } catch (e) { /* ignore */ }
      }
    });
    return out;
  }

  var local = window.LACUNA_LOCAL || {};
  var hash = fromHash();
  var vessel = String(hash.v || local.v || "").replace(/[^0-9]/g, "").slice(0, 4);
  var user = String(hash.u || local.u || "").replace(/[<>&"']/g, "").slice(0, 32);

  // Remember who visited, on this browser only, so later visits can greet them.
  try {
    if (vessel) { localStorage.setItem("lacuna.v", vessel); } else { vessel = localStorage.getItem("lacuna.v") || ""; }
    if (user) { localStorage.setItem("lacuna.u", user); } else { user = localStorage.getItem("lacuna.u") || ""; }
  } catch (e) { /* storage blocked: stay anonymous */ }

  function fill(sel, text) {
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
  }

  if (user) { fill("[data-user]", user); }
  if (vessel) { fill("[data-vessel]", vessel); }
  document.querySelectorAll("[data-known]").forEach(function (el) { el.hidden = !(user || vessel); });
  document.querySelectorAll("[data-unknown]").forEach(function (el) { el.hidden = !!(user || vessel); });

  var now = new Date();
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  fill("[data-now]", now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()));

  // Recordings page: real YouTube embeds when the channel is published, local files otherwise.
  var list = document.getElementById("recordings");
  var cfg = window.LACUNA_CONFIG || { channel: "", videos: [] };
  if (list) {
    var vids = cfg.videos || [];
    if (!vids.length) {
      list.innerHTML = '<p class="empty">the recordings were taken down. try the mirror.</p>';
    }
    vids.forEach(function (v) {
      var box = document.createElement("div");
      box.className = "post";
      var meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = v.date + " - " + v.title;
      var frame = document.createElement("div");
      frame.className = "video";
      if (v.youtube) {
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.youtube);
        f.title = v.title;
        f.loading = "lazy";
        f.allow = "encrypted-media; picture-in-picture";
        f.allowFullscreen = true;
        frame.appendChild(f);
      } else if (v.file) {
        var vid = document.createElement("video");
        vid.src = v.file;
        vid.controls = true;
        vid.preload = "none";
        frame.appendChild(vid);
      }
      var note = document.createElement("p");
      note.textContent = v.note || "";
      box.appendChild(meta);
      box.appendChild(frame);
      box.appendChild(note);
      list.appendChild(box);
    });
    var ch = document.getElementById("channel");
    if (ch && cfg.channel) {
      ch.href = cfg.channel;
      ch.hidden = false;
    }
  }
})();
