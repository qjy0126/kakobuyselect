(function () {
  const page = document.getElementById("item-page");
  const related = document.getElementById("related-grid");
  if (!page) return;

  const products = window.SELECT_PRODUCTS || [];
  const id = new URLSearchParams(location.search).get("id");
  const item = products.find((p) => p.id === id);

  if (!item) {
    page.innerHTML =
      '<p class="item-crumb"><a href="/">Home</a> / <a href="finds/">All finds</a> / <span>Not found</span></p>' +
      "<h1>Product not found</h1>" +
      '<p class="item-lede">This find is missing or outdated. Browse all products instead.</p>' +
      '<p><a class="btn btn-solid" href="finds/">Back to All Finds</a></p>';
    return;
  }

  document.title = item.title + " | Kakobuyspreadsheet";
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.href = "https://kakobuyselect.com/item.html?id=" + encodeURIComponent(item.id);
  }

  const cny =
    item.cny != null
      ? '<p class="item-price"><b>' +
        window.formatCny(item.cny) +
        "</b> <span>≈ " +
        window.formatUsd(item.usd) +
        "</span></p>"
      : '<p class="item-price"><b>' + window.formatUsd(item.usd) + "</b></p>";

  page.innerHTML =
    '<p class="item-crumb">' +
      '<a href="/">Home</a> / <a href="finds/">All finds</a> / ' +
      '<a href="finds/?cat=' + encodeURIComponent(item.category) + '">' +
      window.escapeHtml(item.categoryLabel) +
      "</a> / <span>" +
      window.escapeHtml(item.title) +
      "</span>" +
    "</p>" +
    '<div class="item-layout">' +
      '<div class="item-gallery">' +
        (item.trending ? '<span class="item-badge">Trending</span>' : "") +
        '<img src="' + item.image + '" alt="' + window.escapeHtml(item.title) + '" />' +
      "</div>" +
      '<aside class="item-info">' +
        '<div class="item-tags">' +
          '<span class="tag">' + window.escapeHtml(item.categoryLabel) + "</span>" +
          '<span class="tag">Kakobuy</span>' +
          '<span class="tag tag-qc">QC ready</span>' +
        "</div>" +
        "<h1>" + window.escapeHtml(item.title) + "</h1>" +
        '<p class="item-lede">Spreadsheet find with live Kakobuy checkout. Confirm seller details, sizing, and warehouse QC before shipping.</p>' +
        cny +
        '<div class="item-actions">' +
          '<a class="btn btn-solid" href="' + item.kakobuy + '" target="_blank" rel="noopener">Buy →</a>' +
          '<a class="btn btn-ghost" href="finds/?cat=' + encodeURIComponent(item.category) + '">More ' +
          window.escapeHtml(item.categoryLabel) +
          "</a>" +
        "</div>" +
        '<ul class="item-notes">' +
          "<li>USD price shown for budgeting — final CNY/shipping is on Kakobuy.</li>" +
          "<li>Open Buy →, pick size/colour, then wait for warehouse QC photos.</li>" +
          "<li>This site does not hold stock or process payments.</li>" +
        "</ul>" +
      "</aside>" +
    "</div>";

  if (related) {
    const others = products
      .filter((p) => p.id !== item.id && p.category === item.category)
      .slice(0, 8);
    const fallback =
      others.length >= 4
        ? others
        : products.filter((p) => p.id !== item.id).slice(0, 8);
    const base = window.getSiteBase ? window.getSiteBase() : "";
    related.innerHTML = fallback
      .map((p) => window.productCardHtml(p, window.itemPath(p.id, base)))
      .join("");
  }
})();
