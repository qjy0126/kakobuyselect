(function () {
  const products = window.SELECT_PRODUCTS || [];
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const rootBase = (window.getSiteBase && window.getSiteBase()) || "";
  const detailHref = (id) =>
    (window.itemPath && window.itemPath(id, rootBase)) ||
    rootBase + "item.html?id=" + encodeURIComponent(id);
  const findsHref = (query) => {
    const q = query ? "?q=" + encodeURIComponent(query) : "";
    return rootBase + "finds/" + q;
  };

  const SEARCH_ALIASES = {
    "jordan 4": ["jordan"],
    "jordan": ["jordan"],
    "nike tech": ["nike tech", "tech fleece"],
    "ralph lauren": ["ralph lauren", "ralph"],
    "stone island": ["stone island"],
    "chrome hearts": ["chrome hearts"],
    "moncler": ["moncler"],
    "corteiz": ["corteiz"],
    "trapstar": ["trapstar"],
  };

  function productMatches(p, query) {
    const hay = (p.title + " " + p.categoryLabel).toLowerCase();
    const q = String(query || "").trim().toLowerCase();
    if (!q) return false;
    if (hay.includes(q)) return true;
    if (SEARCH_ALIASES[q]) {
      return SEARCH_ALIASES[q].some((k) => hay.includes(k));
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.length > 0 && tokens.every((t) => hay.includes(t));
  }

  /* Mobile category menu */
  const menuToggle = $("#menu-toggle");
  const catNav = $("#cat-nav");
  if (menuToggle && catNav) {
    menuToggle.addEventListener("click", () => {
      const open = catNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* Trending grid on homepage */
  const trendingGrid = $("#trending-grid");
  if (trendingGrid) {
    const trending = products.filter((p) => p.trending).slice(0, 12);
    trendingGrid.innerHTML = trending
      .map((p) => window.productCardHtml(p, detailHref(p.id)))
      .join("");
  }

  /* Finds page */
  const findsGrid = $("#finds-grid");
  const filterBar = $("#filter-bar");
  if (findsGrid) {
    const params = new URLSearchParams(location.search);
    let activeCat = params.get("cat") || "all";
    const qParam = (params.get("q") || "").trim();
    const pageHero = document.querySelector(".page-hero h1");
    const pageLede = document.querySelector(".page-hero p");
    if (qParam && pageHero) {
      pageHero.textContent = 'Results for "' + qParam + '"';
      if (pageLede) {
        pageLede.textContent = "Products matching this popular search — open any card for details or Buy →.";
      }
    }

    if (filterBar && window.SELECT_CATEGORIES) {
      const cats = window.SELECT_CATEGORIES.slice();
      // Search modal "Pants/Shorts" lands on bottoms
      if (activeCat === "bottoms" && !cats.some((c) => c.id === "bottoms")) {
        const idx = cats.findIndex((c) => c.id === "shorts");
        cats.splice(idx >= 0 ? idx : cats.length, 0, {
          id: "bottoms",
          label: "Pants/Shorts",
        });
      }

      filterBar.innerHTML = cats
        .map((c) => {
          const active = c.id === activeCat ? " is-active" : "";
          return (
            '<button type="button" data-cat="' +
            c.id +
            '" class="' +
            active.trim() +
            '">' +
            c.label +
            "</button>"
          );
        })
        .join("");

      filterBar.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-cat]");
        if (!btn) return;
        activeCat = btn.getAttribute("data-cat");
        $$("button", filterBar).forEach((b) => b.classList.toggle("is-active", b === btn));
        renderFinds(true);
        const url = new URL(location.href);
        if (activeCat === "all") url.searchParams.delete("cat");
        else url.searchParams.set("cat", activeCat);
        history.replaceState(null, "", url);
      });
    }

    const PAGE_SIZE = 96;
    let visibleCount = PAGE_SIZE;
    let filtered = [];

    function currentList() {
      let list = products.slice();
      if (activeCat && activeCat !== "all") {
        // Search "Pants/Shorts" uses bottoms → pants + shorts
        if (activeCat === "bottoms") {
          list = list.filter((p) => p.category === "pants" || p.category === "shorts");
        } else {
          list = list.filter((p) => p.category === activeCat);
        }
      }
      if (qParam) {
        list = list.filter((p) => productMatches(p, qParam));
      }
      return list;
    }

    function renderFinds(reset) {
      if (reset) visibleCount = PAGE_SIZE;
      filtered = currentList();
      const shown = filtered.slice(0, visibleCount);
      let html = shown.length
        ? shown.map((p) => window.productCardHtml(p, detailHref(p.id))).join("")
        : '<p class="search-empty">No finds match this search.</p>';
      if (filtered.length > shown.length) {
        html +=
          '<div class="finds-more" style="grid-column:1/-1;text-align:center;padding:28px 0 8px">' +
          '<p style="margin:0 0 12px;color:var(--muted,#667)">' +
          "Showing " +
          shown.length +
          " of " +
          filtered.length +
          "</p>" +
          '<button type="button" class="btn btn-solid" id="finds-load-more">Load more</button>' +
          "</div>";
      } else if (filtered.length > 0) {
        html +=
          '<p class="finds-more" style="grid-column:1/-1;text-align:center;padding:20px 0;color:var(--muted,#667)">' +
          filtered.length +
          " finds</p>";
      }
      findsGrid.innerHTML = html;
      const moreBtn = $("#finds-load-more");
      if (moreBtn) {
        moreBtn.addEventListener("click", () => {
          visibleCount += PAGE_SIZE;
          renderFinds(false);
        });
      }
    }

    renderFinds(true);
  }

  /* Favorites toggle */
  document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (!fav) return;
    e.preventDefault();
    fav.classList.toggle("is-on");
  });

  /* Search modal — browse (Popular + Categories) by default; results when typing */
  const modal = $("#search-modal");
  const searchOpen = $("#search-open");
  const searchInput = $("#search-input");
  const searchBrowse = $("#search-browse");
  const searchResults = $("#search-results");
  const searchPopular = $("#search-popular");

  function openSearch() {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    renderSearch("");
  }

  function closeSearch() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function showBrowse() {
    if (searchBrowse) searchBrowse.hidden = false;
    if (searchResults) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
    }
  }

  function renderSearch(q) {
    const query = q.trim();
    if (!query) {
      showBrowse();
      return;
    }

    if (searchBrowse) searchBrowse.hidden = true;
    if (!searchResults) return;
    searchResults.hidden = false;

    const allHits = products.filter((p) => productMatches(p, query));
    const hits = allHits.slice(0, 12);

    if (!hits.length) {
      searchResults.innerHTML = '<p class="search-empty">No products match that search.</p>';
      return;
    }

    const seeAll =
      '<a class="search-see-all" href="' +
      findsHref(query) +
      '">See all ' +
      allHits.length +
      " finds →</a>";

    searchResults.innerHTML =
      seeAll +
      hits
        .map(
          (p) =>
            '<a class="search-item" href="' +
            detailHref(p.id) +
            '">' +
            '<img src="' +
            p.image +
            '" alt="" loading="lazy" />' +
            "<div><strong>" +
            window.escapeHtml(p.title) +
            "</strong><span>" +
            window.formatUsd(p.usd) +
            " · " +
            window.escapeHtml(p.categoryLabel) +
            "</span></div>" +
            "</a>"
        )
        .join("");
  }

  if (searchOpen) searchOpen.addEventListener("click", openSearch);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]") || e.target.classList.contains("search-backdrop")) {
        closeSearch();
      }
    });
  }
  if (searchPopular) {
    searchPopular.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-q]");
      if (!btn) return;
      const q = btn.getAttribute("data-q") || "";
      // Jump to finds grid with matching products
      location.href = findsHref(q);
    });
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => renderSearch(searchInput.value));
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });
})();
