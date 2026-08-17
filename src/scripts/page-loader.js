(function () {
  const loader = document.querySelector("[data-page-loader]");
  if (!loader) return;

  const html = document.documentElement;
  const body = document.body;
  let isNavigating = false;
  let loaderHidden = false;

  const showLoader = () => {
    loaderHidden = false;
    loader.classList.remove("is-hidden");
    loader.classList.add("is-entering");
    body?.classList.add("page-is-loading");
  };

  const hideLoader = () => {
    if (loaderHidden) return;
    loaderHidden = true;
    loader.classList.add("is-hidden");
    loader.classList.remove("is-entering");
    body?.classList.remove("page-is-loading");
  };

  const isInternalPageLink = (link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return false;
    if (link.hasAttribute("download")) return false;
    if (link.target && link.target !== "_self") return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.hash) return false;

    return /\.(html)?$/i.test(url.pathname) || !url.pathname.includes(".");
  };

  body?.classList.add("page-is-loading");
  html.classList.add("page-loader-ready");

  if (window.__cycCriticalReady) {
    hideLoader();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || isNavigating) return;
    if (!isInternalPageLink(link)) return;

    const destination = link.href;
    isNavigating = true;
    event.preventDefault();
    showLoader();
    window.location.href = destination;
  });

  window.addEventListener("cyc:critical-ready", hideLoader, { once: true });
  window.addEventListener("load", hideLoader);

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      hideLoader();
      isNavigating = false;
    }
  });
})();
