/* =====================================================================
   script.js — renders the site from data/portfolio-data.js.
   Content lives in the data file; this file only builds and animates it.

   Sections:  1 Helpers · 2 Icons · 3 Shared (nav, footer)
              4 Project cards · 5 Home page · 6 All Projects page
              7 Case-study pages · 8 Behaviour (scroll, reveal, lightbox) · 9 Boot
   ===================================================================== */
(function () {
  "use strict";

  const D = portfolioData;
  const ROOT = document.body.dataset.root || "";   // "" on top-level pages, "../" inside /projects/
  const PAGE = document.body.dataset.page;         // "home" | "projects" | "case"

  /* ---------- 1 · HELPERS ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="yellow">$1</span>');   // **x** → gold
  const isExternal = (u) => /^https?:/.test(u);
  const href = (u) => (/^(https?:|mailto:|tel:|#)/.test(u) ? u : ROOT + u);
  const ext = (u) => (isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : "");
  const visibleProjects = () => D.projects.filter((p) => p.visible !== false);
  const numberOf = (p) => String(visibleProjects().indexOf(p) + 1).padStart(2, "0");   // 01, 02, …

  /* ---------- 2 · ICONS (inline SVG, no icon font) ---------- */
  const stroke = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    github: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    mail: stroke('<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
    chat: stroke('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
    right: stroke('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    left: stroke('<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'),
    external: stroke('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
    download: stroke('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    down: stroke('<polyline points="6 9 12 15 18 9"/>'),
    menu: stroke('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),
    close: stroke('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    // small domain glyphs for the project-visual frame bar — set per project via "domain" in the data file
    finance: stroke('<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
    ecommerce: stroke('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'),
    healthcare: stroke('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="9.5" y1="10.5" x2="14.5" y2="10.5"/>'),
    sql: stroke('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>')
  };

  /* Reusable "showcase" frame for a project image: thin top bar (traffic-light dots + a
     domain glyph + label) over an image area that always uses object-fit:contain, so a
     wide dashboard screenshot is never cropped — it letterboxes inside the frame instead. */
  function mediaFrame(p, label) {
    const icon = p.domain && ICONS[p.domain] ? ICONS[p.domain] : "";
    return `
      <div class="frame-bar">
        <span class="frame-dot frame-dot--r"></span><span class="frame-dot frame-dot--y"></span><span class="frame-dot frame-dot--g"></span>
        <span class="frame-label">${icon}${esc(label)}</span>
      </div>
      <div class="frame-body"><img src="${href(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy" width="1600" height="900"></div>`;
  }

  /* ---------- 3 · SHARED: NAV + FOOTER ---------- */
  function renderNav() {
    const onHome = PAGE === "home";
    const anchor = (id) => (onHome ? `#${id}` : `${ROOT}index.html#${id}`);
    const links = [
      ["Home", anchor("home"), "home"],
      ["Projects", `${ROOT}projects.html`, "projects"],
      ["Skills", anchor("skills"), "skills"],
      ["About", anchor("about"), "about"],
      ["Certifications", anchor("certifications"), "certifications"],
      ["Contact", anchor("contact"), "contact"]
    ];
    const nav = $("#site-nav");
    nav.className = "navbar";
    nav.innerHTML = `
      <div class="nav-container">
        <a class="nav-brand" href="${anchor("home")}">${esc(D.personal.name)}</a>
        <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu">${ICONS.menu}</button>
        <ul class="nav-menu" id="nav-menu">
          ${links.map(([label, url, key]) => `<li><a class="nav-link" href="${url}" data-nav="${key}">${label}</a></li>`).join("")}
        </ul>
      </div>`;
    const toggle = $(".nav-toggle", nav), menu = $(".nav-menu", nav);
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.innerHTML = open ? ICONS.close : ICONS.menu;
    });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", false); toggle.innerHTML = ICONS.menu; } });
    if (PAGE !== "home") $(`[data-nav="projects"]`, nav).classList.add("active");
  }

  function renderFooter() {
    const p = D.personal;
    $("#site-footer").innerHTML = `
      <div class="container footer-inner">
        <p>© ${new Date().getFullYear()} <span class="footer-name">${esc(p.name)}</span></p>
        <div class="footer-links">
          <a href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="${p.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:${p.email}">Email</a>
        </div>
        ${p.availability ? `<span class="footer-status">● ${esc(p.availability)}</span>` : ""}
      </div>`;
    $("#site-footer").className = "footer";
  }

  const sectionTitle = (html) => `<h2 class="section-title">${rich(html)}</h2>`;
  // opts: { icon: svg before label, after: svg after label, attrs: extra attributes }
  const button = (label, url, kind = "filled", opts = {}) =>
    `<a class="btn btn-${kind}" href="${href(url)}"${ext(url)}${opts.attrs ? " " + opts.attrs : ""}>${opts.icon || ""}${esc(label)}${opts.after || ""}</a>`;

  /* ---------- 4 · PROJECT CARDS ----------
     mode "featured": horizontal card with stats (home page)
     mode "grid":     compact vertical card (All Projects page)                       */
  function projectCard(p, mode) {
    const primary = p.page || p.github;
    const stats = mode === "featured" && p.stats?.length
      ? `<ul class="stat-row">${p.stats.map((s) => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`).join("")}</ul>` : "";
    const actions = [
      p.page ? button("View Case Study", p.page, "filled", { after: ICONS.right }) : "",
      button("GitHub", p.github, p.page ? "ghost" : "filled", { icon: ICONS.github })
    ].join("");
    return `
      <article class="project-card project-card--${mode} reveal" data-tags="${esc((p.tags || []).join("|"))}">
        <a class="project-card__media" href="${href(primary)}"${ext(primary)} tabindex="-1" aria-hidden="true">
          ${mediaFrame(p, p.type)}
        </a>
        <div class="project-card__body">
          <div class="project-card__meta"><span class="project-card__num">${numberOf(p)}</span><span>${esc(p.category)}</span><span class="dot"></span><span>${esc(p.type)}</span></div>
          <h3 class="project-card__title">${esc(p.title)}</h3>
          ${mode === "featured" ? `<p class="project-card__subtitle">${esc(p.subtitle)}</p>` : ""}
          <p class="project-card__desc">${esc(p.description)}</p>
          ${stats}
          <ul class="chips">${p.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <div class="project-card__actions">${actions}</div>
        </div>
      </article>`;
  }

  /* ---------- 5 · HOME PAGE ---------- */
  function renderHome() {
    const p = D.personal, h = D.hero, a = D.about;

    $("#home").innerHTML = `
      <div class="container hero-grid">
        <div class="hero-text">
          <span class="hero-pill">${esc(h.pill)}</span>
          <h1 class="hero-name">${h.nameLines.map((l) => `<span>${esc(l)}</span>`).join("")}</h1>
          <p class="hero-intro">${rich(h.intro)}</p>
          <div class="hero-actions">
            ${button("Explore Projects", "projects.html", "filled", { after: ICONS.right })}
            ${button("Download Resume", p.resume, "ghost", { icon: ICONS.download, attrs: `download="${esc(p.resumeDownloadName)}"` })}
          </div>
          ${p.availability ? `<div class="availability"><span class="pulse"></span>${esc(p.availability)}</div>` : ""}
        </div>
        <div class="hero-photo"><div class="profile-frame"><img src="${href(h.photo)}" alt="Portrait of ${esc(p.name)}" width="500" height="500"></div></div>
      </div>
      <a class="hero-scroll" href="#about" aria-label="Scroll to About">${ICONS.down}</a>`;

    $("#about").innerHTML = `
      <div class="container">
        ${sectionTitle("**About** Me")}
        <div class="about-grid">
          <p class="about-greeting">${rich(a.greeting)}</p>
          <div class="about-body">
            ${a.paragraphs.map((t) => `<p>${rich(t)}</p>`).join("")}
            <p class="about-edu"><b>${esc(a.education.degree)}</b> · ${esc(a.education.school)} · ${esc(a.education.status)}</p>
            <div class="about-actions">
              <a class="icon-btn" href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${ICONS.linkedin}</a>
              <a class="icon-btn" href="${p.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${ICONS.github}</a>
              <a class="icon-btn" href="mailto:${p.email}" aria-label="Email">${ICONS.mail}</a>
              ${button("Projects", "projects.html", "ghost")}
            </div>
          </div>
        </div>
      </div>`;

    const sk = D.skills;
    $("#skills").innerHTML = `
      <div class="container">
        ${sectionTitle("**Technical** Skills")}
        <p class="section-lead">The stack I actually use, start to finish, across the projects below — not an exhaustive tool list.</p>
        <div class="skill-core">
          ${sk.core.map((i) => `
            <div class="skill-core__item reveal">
              <span class="skill-icon">${i.icon ? `<img src="${href("assets/images/ui/" + i.icon)}" alt="" loading="lazy" width="40" height="40">` : ""}</span>
              <div><span class="skill-core__name">${esc(i.name)}</span>${i.note ? `<span class="skill-core__note">${esc(i.note)}</span>` : ""}</div>
            </div>`).join("")}
        </div>
        <div class="skill-secondary">
          <div class="skill-familiar">
            <h3>Also familiar with</h3>
            <ul class="familiar-chips">${sk.familiar.map((i) => `<li>${i.icon ? `<img src="${href("assets/images/ui/" + i.icon)}" alt="" loading="lazy" width="18" height="18">` : ""}${esc(i.name)}</li>`).join("")}</ul>
          </div>
          <div class="skill-methods">
            <h3>Methods applied</h3>
            <ul class="methods">${sk.methods.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>`;

    const featured = visibleProjects().filter((x) => x.featured);
    $("#projects").innerHTML = `
      <div class="container">
        ${sectionTitle("**Featured** Projects")}
        <p class="section-lead">End-to-end analytics projects built around real business questions. Screenshots and figures come from the projects themselves.</p>
        <div class="project-list">${featured.map((x) => projectCard(x, "featured")).join("")}</div>
        <div class="section-more">${button("View all projects", "projects.html", "filled", { after: ICONS.right })}</div>
      </div>`;

    $("#certifications").innerHTML = `
      <div class="container">
        <h2 class="subsection-title">Certifications &amp; Simulations</h2>
        <p class="section-lead section-lead--sm">Supplementary to the projects above, not a substitute for them.</p>
        <div class="cert-strip">
          ${D.certifications.map((c) => `
            <a class="cert-pill reveal" href="${href(c.file)}" target="_blank" rel="noopener noreferrer">
              <span class="cert-pill__title">${esc(c.title)}</span>
              <span class="cert-pill__meta">${esc(c.issuer)} · ${esc(c.date)}</span>
              ${ICONS.external}
            </a>`).join("")}
        </div>
      </div>`;

    const pill = (icon, label, url) => `<a class="contact-pill reveal" href="${url}"${ext(url)}><span class="pill-icon">${icon}</span><span>${esc(label)}</span></a>`;
    $("#contact").innerHTML = `
      <div class="container">
        ${sectionTitle("**Contact** Information")}
        <div class="contact-split">
          <div class="contact-list">
            ${pill(ICONS.chat, p.phone + " (WhatsApp)", p.whatsapp)}
            ${pill(ICONS.mail, p.email, "mailto:" + p.email)}
            ${pill(ICONS.linkedin, p.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), p.linkedin)}
            ${pill(ICONS.github, p.github.replace(/^https?:\/\//, ""), p.github)}
          </div>
          <h2 class="contact-tagline">Let's <span class="yellow">connect</span> and <span class="yellow">work together</span>!</h2>
        </div>
      </div>`;
  }

  /* ---------- 6 · ALL PROJECTS PAGE ---------- */
  function renderProjectsPage() {
    const list = visibleProjects();
    $("#projects-intro").innerHTML = `
      <div class="container">
        <span class="hero-pill">Project library</span>
        <h1 class="page-title">All <span class="yellow">Projects</span></h1>
        <p class="section-lead">${list.length} project${list.length === 1 ? "" : "s"} — each with its repository and, where I've written one, a full case study. More are added as I build them.</p>
        <div class="filters" role="group" aria-label="Filter projects"></div>
      </div>`;
    $("#project-grid").innerHTML = list.map((p) => projectCard(p, "grid")).join("");

    const tags = D.projectFilters.filter((t) => list.some((p) => (p.tags || []).includes(t)));
    const bar = $(".filters");
    bar.innerHTML = ["All", ...tags].map((t, i) => `<button type="button" class="filter${i === 0 ? " active" : ""}" aria-pressed="${i === 0}" data-filter="${esc(t)}">${esc(t)}</button>`).join("");
    if (!tags.length) bar.remove();
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter"); if (!btn) return;
      const f = btn.dataset.filter;
      $$(".filter", bar).forEach((b) => { const on = b === btn; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
      $$("#project-grid .project-card").forEach((c) => { c.hidden = !(f === "All" || c.dataset.tags.split("|").includes(f)); });
    });
  }

  /* ---------- 7 · CASE-STUDY PAGES ----------
     The page declares <body data-project="id">; the header, links and pager come from the data file.
     The article body is plain HTML written on each page. */
  function renderCaseStudy() {
    const id = document.body.dataset.project;
    const p = D.projects.find((x) => x.id === id);
    if (!p) { console.warn(`No project with id "${id}" in data/portfolio-data.js`); return; }
    document.title = `${p.title} | ${D.personal.name}`;
    $("#case-hero").innerHTML = `
      <div class="container case-hero__grid">
        <div class="case-hero__text">
          <a class="back-link" href="${ROOT}projects.html">${ICONS.left} Back to Projects</a>
          <div class="project-card__meta"><span class="project-card__num">${numberOf(p)}</span><span>${esc(p.category)}</span><span class="dot"></span><span>${esc(p.type)}</span></div>
          <h1 class="case-title">${esc(p.title)}</h1>
          <p class="case-subtitle">${esc(p.subtitle)}</p>
          <p class="case-summary">${esc(p.description)}</p>
          ${p.stats?.length ? `<ul class="stat-row stat-row--lg">${p.stats.map((s) => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`).join("")}</ul>` : ""}
          <ul class="chips">${p.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <div class="project-card__actions">${button("View GitHub Repository", p.github, "filled", { icon: ICONS.github })}</div>
        </div>
        <div class="case-hero__visual reveal">${mediaFrame(p, p.type)}</div>
      </div>`;

    const list = visibleProjects().filter((x) => x.page), i = list.indexOf(p);
    const pager = $("#case-pager");
    if (pager && list.length) {
      const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
      const showPrev = list.length > 1, showNext = list.length > 1;
      pager.innerHTML = `
        <div class="container pager-grid">
          ${showPrev ? `<a class="pager-link pager-link--prev" href="${href(prev.page)}">${ICONS.left}<span><small>Previous</small><strong>${esc(prev.title)}</strong></span></a>` : "<span></span>"}
          <a class="pager-link pager-link--all" href="${ROOT}projects.html">All Projects</a>
          ${showNext ? `<a class="pager-link pager-link--next" href="${href(next.page)}"><span><small>Next</small><strong>${esc(next.title)}</strong></span>${ICONS.right}</a>` : "<span></span>"}
        </div>`;
    }
  }

  /* ---------- 8 · BEHAVIOUR ---------- */
  function initBehaviour() {
    // Nav shadow + scroll progress bar
    const nav = $("#site-nav"), bar = $("#scroll-progress");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
        nav.classList.toggle("scrolled", y > 20);
        if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
        ticking = false;
      });
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // Fade-up reveal (skipped for reduced motion via CSS + here)
    const revealEls = $$(".reveal");
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach((el) => io.observe(el));
    } else revealEls.forEach((el) => el.classList.add("in"));

    // Scroll-spy for home page nav
    if (PAGE === "home" && "IntersectionObserver" in window) {
      const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) $$(".nav-link").forEach((l) => l.classList.toggle("active", l.dataset.nav === e.target.id));
      }), { rootMargin: "-45% 0px -50% 0px" });
      ["home", "projects", "skills", "about", "certifications", "contact"].forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    }

    // Screenshot lightbox: any <img data-zoom> inside a figure.shot
    const shots = $$("img[data-zoom]");
    if (shots.length) {
      const dlg = document.createElement("dialog");
      dlg.className = "lightbox";
      dlg.innerHTML = `<button class="lightbox-close" aria-label="Close">${ICONS.close}</button><img alt=""><p></p>`;
      document.body.appendChild(dlg);
      shots.forEach((img) => { img.tabIndex = 0; img.addEventListener("click", () => open(img)); img.addEventListener("keydown", (e) => { if (e.key === "Enter") open(img); }); });
      const open = (img) => { $("img", dlg).src = img.currentSrc || img.src; $("img", dlg).alt = img.alt; $("p", dlg).textContent = img.closest("figure")?.querySelector("figcaption")?.textContent || ""; dlg.showModal(); };
      dlg.addEventListener("click", () => dlg.close());
    }

    // Copy buttons on SQL blocks
    $$(".code-block").forEach((block) => {
      const btn = $(".copy-btn", block); if (!btn) return;
      btn.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText($("code", block).innerText); btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1500); } catch (_) { btn.textContent = "Press Ctrl+C"; }
      });
    });
  }

  /* ---------- 9 · BOOT ---------- */
  renderNav();
  renderFooter();
  if (PAGE === "home") renderHome();
  if (PAGE === "projects") renderProjectsPage();
  if (PAGE === "case") renderCaseStudy();
  initBehaviour();
})();
