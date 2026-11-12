// Interacciones del sitio. Sin dependencias.
const html = document.documentElement;
html.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Pantalla de carga: sale cuando la imagen principal está lista ── */
const loader = document.querySelector<HTMLElement>('[data-loader]');
if (loader && html.classList.contains('intro-seen')) loader.remove();
else if (loader) {
  const heroImg = document.querySelector<HTMLImageElement>('.hero__media img');
  const elapsed = performance.now();
  const ready = heroImg && !heroImg.complete ? heroImg.decode().catch(() => undefined) : Promise.resolve();
  const atLeast = new Promise((r) => setTimeout(r, Math.max(0, 1100 - elapsed)));
  const atMost = new Promise((r) => setTimeout(r, Math.max(0, 1900 - elapsed)));
  Promise.race([Promise.all([ready, atLeast]), atMost]).then(() => {
    loader.classList.add('is-out');
    setTimeout(() => loader.remove(), 900);
  });
}

/* ── Cabecera: transparente sobre la foto, sólida al desplazarse ── */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const overlay = header.dataset.overlay === 'true';
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    if (overlay) header.dataset.solid = y > 40 ? 'true' : 'false';
    const busy = document.querySelector('dialog[open]') || header.querySelector('[data-drop-btn][aria-expanded="true"]');
    header.dataset.hidden = !busy && y > 640 && y > lastY + 4 ? 'true' : y < lastY - 4 || y < 640 ? 'false' : header.dataset.hidden || 'false';
    lastY = y;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
  header.addEventListener('focusin', () => (header.dataset.hidden = 'false'));
}

/* ── Menú desplegable de empresas ── */
document.querySelectorAll<HTMLElement>('[data-drop]').forEach((drop) => {
  const btn = drop.querySelector<HTMLButtonElement>('[data-drop-btn]')!;
  const set = (open: boolean) => btn.setAttribute('aria-expanded', String(open));
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  drop.addEventListener('focusout', (e) => {
    if (!drop.contains(e.relatedTarget as Node)) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      set(false);
      btn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!drop.contains(e.target as Node)) set(false);
  });
});

/* ── Menú móvil ── */
const menu = document.getElementById('mobile-menu') as HTMLDialogElement | null;
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('[data-menu-open]') && menu && !menu.open) {
    menu.showModal();
    html.classList.add('menu-open');
  }
  if (t.closest('[data-menu-close]') && menu?.open) menu.close();
});
menu?.addEventListener('close', () => html.classList.remove('menu-open'));

/* ── Entradas al hacer scroll ──
   Las máscaras (.reveal-mask) empiezan recortadas a altura cero con clip-path y
   Chrome/Safari cuentan ese recorte en la intersección: nunca llegarían al umbral.
   Por eso se vigila su contenedor y, al entrar, se activa la máscara. */
const revealOf = new Map<Element, HTMLElement[]>();
const io = new IntersectionObserver(
  (entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      for (const el of revealOf.get(en.target) ?? []) {
        if (el.dataset.delay) el.style.setProperty('--d', `${el.dataset.delay}ms`);
        el.classList.add('is-in');
        if (el.matches('[data-count-wrap]')) el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
      }
      io.unobserve(en.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
);
document.querySelectorAll<HTMLElement>('.reveal, .reveal-mask, [data-count-wrap]').forEach((el) => {
  const holder = el.closest<HTMLElement>('[data-delay]');
  if (holder && !el.dataset.delay) el.dataset.delay = holder.dataset.delay;
  const target = el.matches('.reveal-mask') && el.parentElement ? el.parentElement : el;
  revealOf.set(target, [...(revealOf.get(target) ?? []), el]);
  io.observe(target);
});

/* ── Contadores ── */
function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count || 0);
  if (reduce || !target) return;
  const dur = 1400;
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 4))));
    if (p < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
}

/* ── Parallax sutil de la portada ── */
const parallax = document.querySelector<HTMLElement>('[data-parallax]');
if (parallax && !reduce) {
  const factor = Number(parallax.dataset.parallax || 0.12);
  const apply = () => (parallax.style.transform = `translate3d(0, ${(scrollY * factor).toFixed(1)}px, 0)`);
  let active = true;
  // Al volver a la portada de un salto (logo, «Inicio») el último scroll pudo
  // ocurrir con la portada fuera de pantalla: se recoloca al reaparecer.
  new IntersectionObserver(([en]) => {
    active = en.isIntersecting;
    if (active) apply();
  }).observe(parallax.parentElement!);
  let raf = 0;
  addEventListener('scroll', () => {
    if (!active || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      apply();
    });
  }, { passive: true });
}

/* ── Mapa: dibuja las rutas al entrar y pausa las ondas fuera de pantalla ── */
const map = document.querySelector<HTMLElement>('[data-map]');
if (map) {
  new IntersectionObserver(
    ([en]) => {
      map.classList.toggle('is-in', en.isIntersecting || map.classList.contains('is-in'));
      map.classList.toggle('is-paused', !en.isIntersecting);
    },
    { threshold: 0.25 }
  ).observe(map);
}

/* ── Navegación activa según la sección visible (portada) ── */
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('.site-nav a[href^="/#"]')];
if (navLinks.length && document.body.dataset.overlayHeader === 'true' && location.pathname === '/') {
  const byId = new Map(navLinks.map((a) => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const a = byId.get(en.target.id);
        if (a && en.isIntersecting) {
          navLinks.forEach((l) => l.removeAttribute('aria-current'));
          a.setAttribute('aria-current', 'true');
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  byId.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
  });
}

/* ── Formulario de contacto: abre el correo con el mensaje redactado ── */
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const note = status?.textContent ?? '';
  const done = form.parentElement!.querySelector<HTMLElement>('[data-form-done]');
  form.addEventListener('input', (e) => {
    const f = e.target as HTMLInputElement;
    if (f.getAttribute('aria-invalid') === 'true' && f.checkValidity()) f.removeAttribute('aria-invalid');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad: HTMLElement | null = null;
    form.querySelectorAll<HTMLInputElement>('input, textarea').forEach((f) => {
      if (f.checkValidity()) f.removeAttribute('aria-invalid');
      else {
        f.setAttribute('aria-invalid', 'true');
        firstBad ??= f;
      }
    });
    if (status) {
      status.textContent = firstBad ? 'Revise los campos marcados.' : note;
      status.dataset.kind = firstBad ? 'error' : 'info';
    }
    if (firstBad) return (firstBad as HTMLElement).focus();
    const fd = new FormData(form);
    const v = (k: string) => String(fd.get(k) ?? '').trim();
    const body = [`Nombre: ${v('nombre')}`, `Teléfono: ${v('telefono')}`, `Email: ${v('email')}`, '', v('mensaje')].join('\n').trim();
    const subject = `Contacto web — ${v('nombre')}`;
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.hidden = true;
    if (done) {
      done.hidden = false;
      done.focus();
    }
  });
  done?.querySelector('[data-form-again]')?.addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    done.hidden = true;
    form.querySelector<HTMLInputElement>('input')?.focus();
  });
}
