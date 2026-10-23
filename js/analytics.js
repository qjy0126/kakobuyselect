/* kakobuyselect — GA4 / Firebase Analytics (G-Z1NSQ50ZG9 on kakobuywebsite3) */
(function () {
  var MEASUREMENT_ID = "G-Z1NSQ50ZG9";
  window.KF = window.KF || {};
  window.KF.analyticsId = MEASUREMENT_ID;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: "SameSite=None;Secure",
  });

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(s);
})();
