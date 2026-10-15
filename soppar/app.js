(() => {
  "use strict";

  const { SOPPAR, OKI, MATVIRDI } = window;
  const SITE = "Soppar í Føroyum";
  const LEDE = "Flestu fólk ganga í bø og haga uttan at varnast hesar løgnu verur, sum einans hava havt heitið hundaland.";
  const GRID_SIZES = "(min-width: 1240px) 280px, (min-width: 940px) 30vw, (min-width: 600px) 45vw, 92vw";
  const DETAIL_SIZES = "(min-width: 1200px) 1080px, 92vw";

  const ICON = {
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  };

  const byId = new Map(SOPPAR.map((s) => [s.id, s]));
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  const byName = (a, b) => a.name.localeCompare(b.name, "fo");

  const SORTS = {
    nafn:     { name: "Heiti",       cmp: byName },
    latin:    { name: "Latín",       cmp: (a, b) => a.latin.localeCompare(b.latin, "en") },
  };

  const listEl = document.getElementById("list");
  const detailEl = document.getElementById("detail");
  const zoom = document.getElementById("zoom");
  const zoomImg = zoom.querySelector("img");
  const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");

  const state = { oki: "", matvirdi: "", q: "", sort: "" };
  const sortedList = () =>
    state.sort ? [...SOPPAR].sort(SORTS[state.sort].cmp) : SOPPAR;
  let current = null; // species in the detail view, null while the list is shown
  let listScroll = 0;

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Running text in data.js marks scientific names as *Latin*.
  const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<i lang="la">$1</i>');

  // Lower-case and drop accents so that e.g. "smorsoppur" finds "smørsoppur".
  const fold = (s) =>
    s.toLowerCase().replace(/ð/g, "d").replace(/ø/g, "o").replace(/æ/g, "ae")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const countText = (n) => (n === 1 ? "1 soppur" : `${n} soppar`);
  const photo = (s, small) => `myndir/${s.id}${small ? "-800" : ""}.jpg`;
  const srcset = (s) => `${photo(s, true)} 800w, ${photo(s)} 1600w`;
  const plainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

  const SEP = ' <span class="sep" aria-hidden="true">·</span> ';

  function meta(s) {
    const oki = s.habitats.map((h) => OKI[h].name).join(" · ");
    return `<span>${esc(oki)}</span>${SEP}` +
      `<span class="edibility"><span class="dot dot--${s.edibility}" aria-hidden="true"></span>` +
      `${esc(MATVIRDI[s.edibility].name)}</span>`;
  }

  /* ---------- Overview ---------- */

  function chips(name, legend, options, allLabel = "Øll") {
    const items = [["", allLabel], ...Object.entries(options).map(([key, o]) => [key, o.name])];
    const labels = items.map(([value, label]) => {
      const dot = name === "matvirdi" && value
        ? `<span class="dot dot--${value}" aria-hidden="true"></span>` : "";
      return `<label><input type="radio" name="${name}" value="${value}"><span>${dot}${esc(label)}</span></label>`;
    });
    return `<fieldset class="group"><legend>${legend}</legend><div class="segmented">${labels.join("")}</div></fieldset>`;
  }

  function card(s, i) {
    return `<li data-id="${s.id}">
      <a class="card" href="#${s.id}">
        <span class="card-photo"><img data-photo="${s.id}" src="${photo(s, true)}" srcset="${srcset(s)}"
          sizes="${GRID_SIZES}" width="800" height="${Math.round(s.photo[1] / 2)}" alt=""
          decoding="async"${i < 4 ? "" : ' loading="lazy"'}></span>
        <span class="card-name">${esc(s.name)}</span>
        <span class="card-latin" lang="la">${esc(s.latin)}</span>
        <span class="meta">${meta(s)}</span>
      </a>
    </li>`;
  }

  function renderList() {
    listEl.innerHTML = `
      <h1 class="visually-hidden">${SITE}</h1>
      <section class="intro"><p class="lede">${LEDE}</p></section>
      <div class="filters">
        ${chips("oki", "Vakstrarøki", OKI)}
        ${chips("matvirdi", "Matvirði", MATVIRDI)}
        <button type="button" class="sort-toggle" data-sort-toggle>
          <span class="sort-fo">A–Ø Føroyskt</span><span class="sort-la">A–Z Vísindaligt</span>
        </button>
        <div class="search">
          <label class="visually-hidden" for="leita">Leita eftir soppi</label>
          ${ICON.search}
          <input id="leita" type="search" placeholder="Leita…" autocomplete="off" spellcheck="false">
        </div>
      </div>
      <div class="status">
        <p class="caption" hidden></p>
        <p class="count" role="status"></p>
      </div>
      <ul class="grid">${SOPPAR.map(card).join("")}</ul>
      <p class="empty" hidden>Eingin soppur funnin.</p>`;

    listEl.addEventListener("change", (e) => {
      if (e.target.type !== "radio") return;
      state[e.target.name] = e.target.value;
      filtersChanged();
    });
    listEl.addEventListener("input", (e) => {
      if (e.target.id !== "leita") return;
      state.q = e.target.value;
      filtersChanged();
    });
    listEl.addEventListener("click", (e) => {
      if (e.target.closest("[data-sort-toggle]")) {
        state.sort = state.sort === "nafn" ? "latin" : "nafn";
        syncControls();
        filtersChanged();
        return;
      }
      const a = e.target.closest("a.card");
      if (!a || !plainClick(e)) return;
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      history.pushState({ fromList: true }, "", `#${id}`);
      navigate({ sopp: byId.get(id) });
    });
  }

  function syncControls() {
    for (const input of listEl.querySelectorAll('input[type="radio"]')) {
      input.checked = input.value === state[input.name];
    }
    const toggle = listEl.querySelector("[data-sort-toggle]");
    const latin = state.sort === "latin";
    toggle.setAttribute("aria-pressed", String(state.sort === "nafn" || latin));
    toggle.dataset.mode = latin ? "la" : "fo";
    toggle.title = latin ? "Røð eftir vísindaligum navni (trýst fyri føroyskt navn)"
                         : "Røð í stavrøð (trýst aftur fyri vísindaligt navn)";
    const search = listEl.querySelector("#leita");
    if (search.value !== state.q) search.value = state.q;
  }

  function applyFilters() {
    const grid = listEl.querySelector(".grid");
    const items = new Map([...grid.children].map((li) => [li.dataset.id, li]));
    for (const s of sortedList()) grid.appendChild(items.get(s.id));
    const q = fold(state.q.trim());
    let shown = 0;
    for (const li of listEl.querySelectorAll(".grid > li")) {
      const s = byId.get(li.dataset.id);
      const show = (!state.oki || s.habitats.includes(state.oki)) &&
        (!state.matvirdi || s.edibility === state.matvirdi) &&
        (!q || fold(s.name).includes(q) || fold(s.latin).includes(q));
      if (show && li.hidden) {
        li.classList.remove("is-entering");
        void li.offsetWidth; // restart the fade-in
        li.classList.add("is-entering");
      }
      li.hidden = !show;
      if (show) shown++;
    }
    listEl.querySelector(".count").textContent = countText(shown);
    listEl.querySelector(".empty").hidden = shown > 0;
    const caption = listEl.querySelector(".caption");
    caption.textContent = state.oki ? OKI[state.oki].text : "";
    caption.hidden = !state.oki;
  }

  function listUrl() {
    const p = new URLSearchParams();
    if (state.oki) p.set("oki", state.oki);
    if (state.matvirdi) p.set("matvirdi", state.matvirdi);
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.sort) p.set("sort", state.sort);
    const qs = p.toString();
    return qs ? `#?${qs}` : location.pathname + location.search;
  }

  function filtersChanged() {
    applyFilters();
    history.replaceState(null, "", listUrl());
  }

  /* ---------- Detail ---------- */

  function renderDetail(s) {
    const list = sortedList();
    const i = list.indexOf(s);
    const prev = list[(i - 1 + list.length) % list.length];
    const next = list[(i + 1) % list.length];
    const rows = s.description
      .map(([label, text]) => `<div><dt>${esc(label)}</dt><dd>${rich(text)}</dd></div>`).join("");
    const size = s.size ? `${SEP}<span>${esc(s.size)}</span>` : "";
    const lead = s.lead ? `<p class="lead">${rich(s.lead)}</p>` : "";
    const food = s.edibilityText
      ? `<section class="block"><h2>Matvirði</h2><p>${rich(s.edibilityText)}</p></section>` : "";

    detailEl.innerHTML = `
      <article class="detail">
        <a class="back" href="${esc(listUrl())}">${ICON.left}Allir soppar</a>
        <figure class="detail-photo">
          <button class="photo-button" type="button" aria-label="Vís størri mynd">
            <img data-photo="${s.id}" src="${photo(s)}" srcset="${srcset(s)}" sizes="${DETAIL_SIZES}"
              width="${s.photo[0]}" height="${s.photo[1]}" alt="${esc(s.name)}">
          </button>
        </figure>
        <div class="detail-body">
          <header class="detail-head">
            <h1 tabindex="-1">${esc(s.name)}</h1>
            <p class="latin" lang="la">${esc(s.latin)}</p>
            <p class="meta">${meta(s)}${size}</p>
          </header>
          ${lead}
          <section class="block">
            <h2>Vakstrarstaður</h2>
            <p>${rich(s.habitatText)}</p>
          </section>
          ${food}
          <section class="block">
            <h2>Lýsing</h2>
            <dl class="description">${rows}</dl>
          </section>
        </div>
        <nav class="pager" aria-label="Aðrir soppar">
          <a href="#${prev.id}" rel="prev" data-step>
            <small>${ICON.left}Fyrri</small><span class="name">${esc(prev.name)}</span>
          </a>
          <a href="#${next.id}" rel="next" data-step>
            <small>Næsti${ICON.right}</small><span class="name">${esc(next.name)}</span>
          </a>
        </nav>
      </article>`;
  }

  function goBack() {
    if (history.state && history.state.fromList) {
      history.back(); // the hashchange handler renders the list
    } else {
      history.pushState(null, "", listUrl());
      navigate(readUrl());
    }
  }

  function stepTo(id) {
    history.replaceState(history.state, "", `#${id}`);
    navigate({ sopp: byId.get(id) });
  }

  function step(delta) {
    const list = sortedList();
    const i = list.indexOf(current);
    stepTo(list[(i + delta + list.length) % list.length].id);
  }

  detailEl.addEventListener("click", (e) => {
    const link = e.target.closest("a.back, a[data-step]");
    if (link && plainClick(e)) {
      e.preventDefault();
      if (link.classList.contains("back")) goBack();
      else stepTo(link.getAttribute("href").slice(1));
    } else if (e.target.closest(".photo-button")) {
      zoomImg.src = photo(current);
      zoomImg.alt = current.name;
      zoom.showModal();
    }
  });

  zoom.addEventListener("click", () => zoom.close());

  document.addEventListener("keydown", (e) => {
    if (!current || zoom.open || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Escape") goBack();
    else return;
    e.preventDefault();
  });

  /* ---------- Routing ---------- */

  // "#<id>" shows a species, "#?oki=…&matvirdi=…&q=…" a filtered overview.
  function readUrl() {
    const hash = location.hash.slice(1);
    if (hash.startsWith("?")) {
      const p = new URLSearchParams(hash.slice(1));
      const oki = p.get("oki") || "";
      const matvirdi = p.get("matvirdi") || "";
      const sort = p.get("sort") || "";
      return {
        list: {
          oki: has(OKI, oki) ? oki : "",
          matvirdi: has(MATVIRDI, matvirdi) ? matvirdi : "",
          q: p.get("q") || "",
          sort: has(SORTS, sort) ? sort : "",
        },
      };
    }
    const sopp = byId.get(decodeURIComponent(hash));
    return sopp ? { sopp } : { list: { oki: "", matvirdi: "", q: "", sort: "" } };
  }

  function render(route) {
    if (route.sopp) {
      if (!current) listScroll = window.scrollY;
      current = route.sopp;
      renderDetail(current);
      listEl.hidden = true;
      detailEl.hidden = false;
      document.title = `${current.name} – ${SITE}`;
      window.scrollTo(0, 0);
      detailEl.querySelector("h1").focus({ preventScroll: true });
    } else {
      const from = current;
      current = null;
      Object.assign(state, route.list);
      syncControls();
      applyFilters();
      detailEl.hidden = true;
      detailEl.innerHTML = "";
      listEl.hidden = false;
      document.title = SITE;
      window.scrollTo(0, from ? listScroll : 0);
      const link = from && listEl.querySelector(`li[data-id="${from.id}"]:not([hidden]) a`);
      if (link) link.focus({ preventScroll: true });
    }
  }

  // Give the photo a shared name so it glides between the card and the detail view.
  function tagPhoto(id, on) {
    const img = id && document.querySelector(`.view:not([hidden]) [data-photo="${id}"]`);
    if (img) img.style.viewTransitionName = on ? "photo" : "";
  }

  function navigate(route) {
    const fromId = current && current.id;
    const toId = route.sopp && route.sopp.id;
    if (!document.startViewTransition || !motionOk.matches || (!fromId && !toId)) {
      render(route);
      return;
    }
    const morphId = fromId && toId ? null : toId || fromId;
    tagPhoto(morphId, true);
    const transition = document.startViewTransition(() => {
      tagPhoto(morphId, false);
      render(route);
      tagPhoto(morphId, true);
    });
    transition.finished.finally(() => tagPhoto(morphId, false));
  }

  window.addEventListener("hashchange", () => navigate(readUrl()));

  /* ---------- Start ---------- */

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  renderList();
  document.documentElement.classList.add("is-arriving");
  setTimeout(() => document.documentElement.classList.remove("is-arriving"), 1200);
  render(readUrl());
})();
