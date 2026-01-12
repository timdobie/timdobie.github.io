// photos-gallery.js
// Lightweight “Windows Photos-style” fullscreen gallery for a static website.
// Requires: window.FLIPSIDE_PHOTOS (from photos-manifest.js)

(function(){
  const API = {};
  const BASE_PATH = "images/photos"; 

  function splitCamelWords(s){
    const parts = (s.match(/[A-Z][a-z0-9]*/g) || [s]);
    return parts.join(" ");
  }

  function parseFolderName(folder){
    // Expect: <GigName><DDMMYYYY> (e.g. HereAndNowLounge01072026)
    const m = folder.match(/^(.*?)(\d{2})(\d{2})(\d{4})$/);
    if(!m){
      return { title: folder, pretty: folder };
    }
    const namePart = m[1] || "";
    const dd = m[2], mm = m[3], yyyy = m[4];

    const title = splitCamelWords(namePart).trim().replace(/\s+/g, " ");
    const prettyDate = `${dd}/${mm}/${yyyy}`;
    const pretty = title ? `${title} - ${prettyDate}` : prettyDate;
    return { title, pretty, dd, mm, yyyy };
  }

  function getManifest(){
    return Array.isArray(window.FLIPSIDE_PHOTOS) ? window.FLIPSIDE_PHOTOS : [];
  }

  function findGig(folder){
    return getManifest().find(g => (g.folder || "") === folder);
  }

  // ===== Modal state =====
  let state = {
    folder: null,
    photos: [],
    idx: 0,
    label: "Photos"
  };

  function el(id){ return document.getElementById(id); }

  function openModal(){
    const modal = el("gallery-modal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(){
    const modal = el("gallery-modal");
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setIndex(i){
    if(!state.photos.length) return;
    state.idx = (i + state.photos.length) % state.photos.length;

    const img = el("gallery-img");
    img.src = state.photos[state.idx];

    // active thumb
    const strip = el("gallery-strip");
    strip.querySelectorAll(".gallery-thumb").forEach((t, n) => {
      t.classList.toggle("active", n === state.idx);
    });

    // Keep active thumb visible
    const active = strip.querySelector(".gallery-thumb.active");
    if(active){
      const r = active.getBoundingClientRect();
      const pr = strip.getBoundingClientRect();
      if(r.left < pr.left || r.right > pr.right){
        active.scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
      }
    }

    // Update title with index
    el("gallery-title").textContent = `${state.label}  (${state.idx+1}/${state.photos.length})`;
  }

  function buildStrip(){
    const strip = el("gallery-strip");
    strip.innerHTML = "";
    state.photos.forEach((src, i) => {
      const t = document.createElement("img");
      t.className = "gallery-thumb";
      t.src = src;
      t.alt = "Thumbnail";
      t.addEventListener("click", () => setIndex(i));
      strip.appendChild(t);
    });
  }

  function wireOnce(){
    if(wireOnce._done) return;
    wireOnce._done = true;

    el("gallery-prev")?.addEventListener("click", () => setIndex(state.idx - 1));
    el("gallery-next")?.addEventListener("click", () => setIndex(state.idx + 1));
    el("gallery-close")?.addEventListener("click", closeModal);

    // Click outside image closes
    el("gallery-modal")?.addEventListener("click", (e) => {
      if(e.target && e.target.id === "gallery-modal") closeModal();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      const modalOpen = el("gallery-modal")?.classList.contains("open");
      if(!modalOpen) return;

      if(e.key === "Escape") closeModal();
      else if(e.key === "ArrowLeft") setIndex(state.idx - 1);
      else if(e.key === "ArrowRight") setIndex(state.idx + 1);
    });
  }

  API.openGigGallery = function(folder){
    const gig = findGig(folder);

    const meta = parseFolderName(folder);
    state.folder = folder;
    state.label = meta.pretty || meta.title || "Photos";

    const images = (gig && Array.isArray(gig.images)) ? gig.images : [];
    state.photos = images.map(fn => `${BASE_PATH}/${folder}/${fn}`);

    wireOnce();

    if(!state.photos.length){
      // Fail nicely: open modal with message in title
      el("gallery-title").textContent = `${state.label} (no images listed)`;
      el("gallery-img").removeAttribute("src");
      el("gallery-strip").innerHTML = "";
      openModal();
      return;
    }

    buildStrip();
    openModal();
    setIndex(0);
  };

  API.renderGigButtons = function(containerId){
    const host = document.getElementById(containerId);
    if(!host) return;

    const gigs = getManifest().slice();

    // Sort newest date first (based on DDMMYYYY suffix)
    gigs.sort((a,b) => {
      const da = String(a.folder || "").match(/(\d{8})$/)?.[1] || "";
      const db = String(b.folder || "").match(/(\d{8})$/)?.[1] || "";
      return db.localeCompare(da);
    });

    host.innerHTML = "";
    gigs.forEach(g => {
      const folder = g.folder;
      const meta = parseFolderName(folder);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photo-gig-btn";
      btn.innerHTML = `<span>${meta.title || folder}</span><span class="sub">${(meta.dd && meta.mm && meta.yyyy) ? `${meta.dd}/${meta.mm}/${meta.yyyy}` : ""}</span>`;
      btn.addEventListener("click", () => API.openGigGallery(folder));
      host.appendChild(btn);
    });
  };

  window.FlipSidePhotos = API;
})();
