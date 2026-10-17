// The site header (wordmark + top navigation), shared by every page.
// To add or rename a section, change NAV below; each page only needs
//   <header class="site-header" id="site-header" data-page="…"></header>
//   <script src="nav.js"></script>
// where data-page is the key of the page it is on ("soppar" or "eydkenni").
(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const page = header.dataset.page;
  const onIndex = page === "soppar"; // index.html shows the overview and the quiz

  // On index.html the links are plain hashes, so they switch views without reloading.
  const NAV = [
    { key: "soppar", label: "Soppar", href: onIndex ? "#" : "index.html" },
    { key: "eydkenni", label: "Eyðkenni", href: "eydkenni.html" },
    { key: "kviss", label: "Kviss", href: onIndex ? "#kviss" : "index.html#kviss" },
  ];

  const links = NAV.map(({ key, label, href }) =>
    `<a class="nav-link" href="${href}" data-nav="${key}"` +
    `${key === page && key !== "soppar" ? ' aria-current="page"' : ""}><span>${label}</span></a>`
  ).join("");

  header.innerHTML = `
    <div class="bar">
      <a class="wordmark" href="${NAV[0].href}">
        <img class="wordmark-mark" src="myndir/soppur.png" width="52" height="160" alt="">
        Soppar í Føroyum
      </a>
      <nav class="site-nav" id="site-nav" aria-label="Flokkar">${links}</nav>
    </div>`;
})();
