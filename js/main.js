async function loadScenes() {
  return import("./scenes.js");
}

function setupReveal() {
  const els = document.querySelectorAll(
    ".section-head, .card, .skill-card, .timeline li, .edu-card, .cert-list, .project-copy, .experience-aside, .contact-grid, .explore-grid article, .tech-tile, .hero-split-inner, .contact-block"
  );
  els.forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

function setupNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setupInfoDialog() {
  const triggers = document.querySelectorAll("[data-info-title][data-info-text]");
  if (!triggers.length) return;

  let dialog = document.getElementById("site-info-dialog");
  if (!dialog || !(dialog instanceof HTMLDialogElement)) {
    dialog = document.createElement("dialog");
    dialog.id = "site-info-dialog";
    dialog.className = "site-info-dialog";
    dialog.setAttribute("aria-labelledby", "site-info-dialog-title");
    dialog.innerHTML = `
      <div class="site-info-dialog__panel">
        <button type="button" class="site-info-dialog__close" aria-label="Cerrar">×</button>
        <h3 id="site-info-dialog-title" class="site-info-dialog__title"></h3>
        <div class="site-info-dialog__body"></div>
      </div>`;
    document.body.appendChild(dialog);

    const close = () => {
      dialog.close();
      document.body.style.overflow = "";
    };

    dialog.querySelector(".site-info-dialog__close").addEventListener("click", close);
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) close();
    });
    dialog.addEventListener("close", () => {
      document.body.style.overflow = "";
    });
  }

  const titleEl = dialog.querySelector(".site-info-dialog__title");
  const bodyEl = dialog.querySelector(".site-info-dialog__body");

  triggers.forEach((el) => {
    el.classList.add("is-click-detail");
    el.addEventListener("click", () => {
      const raw = el.getAttribute("data-info-text") || "";
      const parts = raw
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      titleEl.textContent = el.getAttribute("data-info-title") || "";
      bodyEl.innerHTML = parts.length
        ? parts.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
        : `<p>${escapeHtml(raw.trim())}</p>`;
      document.body.style.overflow = "hidden";
      dialog.showModal();
    });
  });
}

const yEl = document.getElementById("y");
if (yEl) yEl.textContent = String(new Date().getFullYear());

setupReveal();
setupNav();
setupInfoDialog();

const webglRoot = document.getElementById("webgl-root");
const pcCanvas = document.getElementById("pc-canvas");
const projectCanvas = document.getElementById("project-canvas");

if (webglRoot || pcCanvas || projectCanvas) {
  loadScenes()
    .then((S) => {
      try {
        if (webglRoot) S.initHero3D(webglRoot);
      } catch (e) {
        console.error("Inicio 3D (hero):", e);
      }
      try {
        if (pcCanvas instanceof HTMLCanvasElement) S.initWorkstation3D(pcCanvas);
      } catch (e) {
        console.error("Inicio 3D (placa / experiencia):", e);
      }
      try {
        if (projectCanvas instanceof HTMLCanvasElement) S.initMobileAI3D(projectCanvas);
      } catch (e) {
        console.error("Inicio 3D (proyecto / móvil):", e);
      }
    })
    .catch((err) => {
      console.error("No se pudo importar scenes.js o Three (ruta / importmap):", err);
    });
}
