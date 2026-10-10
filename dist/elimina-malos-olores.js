const story = document.querySelector('[data-story]');
const stage = story?.querySelector('.story-stage');
const header = document.querySelector('[data-header]');
const loader = document.querySelector('[data-loader]');
const loaderValue = document.querySelector('[data-loader-value]');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const imageUrls = [
  '/blue-drop-story-v2/01-superficie.webp',
  '/blue-drop-story-v2/02-interior-horror.webp',
  '/blue-drop-story-v2/03-transformacion.webp'
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const map = (value, start, end) => clamp((value - start) / (end - start));
const smooth = value => value * value * (3 - 2 * value);

function chapterOpacity(progress, from, to) {
  const edge = Math.min(0.055, (to - from) * 0.28);
  const enter = from <= 0 ? 1 : smooth(map(progress, from, from + edge));
  const exit = to >= 1 ? 1 : 1 - smooth(map(progress, to - edge, to));
  return clamp(Math.min(enter, exit));
}

function render() {
  if (!story || !stage || reducedMotion) return;
  const rect = story.getBoundingClientRect();
  const travel = Math.max(story.offsetHeight - innerHeight, 1);
  const progress = clamp(-rect.top / travel);
  const descent = smooth(map(progress, 0.05, 0.34));
  const inside = smooth(map(progress, 0.22, 0.38));
  const reveal = smooth(map(progress, 0.61, 0.87));

  stage.style.setProperty('--p', progress.toFixed(4));
  stage.style.setProperty('--surface-scale', (1 + descent * 4.1).toFixed(4));
  stage.style.setProperty('--inside-opacity', inside.toFixed(4));
  stage.style.setProperty('--inside-scale', (1 + map(progress, 0.34, 1) * 0.22).toFixed(4));
  stage.style.setProperty('--solution-reveal', reveal.toFixed(4));
  stage.style.setProperty('--solution-edge', `${(reveal * 100).toFixed(2)}%`);

  chapters.forEach(chapter => {
    const from = Number(chapter.dataset.from);
    const to = Number(chapter.dataset.to);
    const opacity = chapterOpacity(progress, from, to);
    chapter.style.opacity = opacity.toFixed(3);
    if (chapter.classList.contains('story-copy-finale')) {
      chapter.style.transform = `translate(-50%, calc(-50% + ${(1 - opacity) * 24}px))`;
    } else {
      chapter.style.transform = `translateY(${(1 - opacity) * 24}px)`;
    }
  });

  header?.classList.toggle('is-quiet', progress > 0.19 && progress < 0.82);
}

let scheduled = false;
function scheduleRender() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    render();
    scheduled = false;
  });
}

async function loadImages() {
  let loaded = 0;
  await Promise.all(imageUrls.map(url => new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = image.onerror = () => {
      loaded += 1;
      if (loaderValue) loaderValue.textContent = String(Math.round((loaded / imageUrls.length) * 100)).padStart(2, '0');
      resolve();
    };
    image.src = url;
  })));
  loader?.classList.add('is-ready');
  document.body.classList.add('is-ready');
  render();
}

addEventListener('scroll', scheduleRender, { passive: true });
addEventListener('resize', scheduleRender, { passive: true });
render();
loadImages();

const contextData = {
  casa: {
    label: 'EN CASA',
    title: 'Tu baño se ve limpio.\nLa coladera dice otra cosa.',
    copy: 'Baños, cocinas, lavabos y coladeras pueden conservar el problema debajo de lo visible.',
    items: ['Baño', 'Cocina', 'Coladera', 'Tubería'],
    href: 'https://wa.me/529993577687?text=Hola,%20tengo%20un%20problema%20de%20mal%20olor%20en%20casa'
  },
  restaurante: {
    label: 'EN RESTAURANTE',
    title: 'La cocina cierra.\nLa tubería sigue trabajando.',
    copy: 'La grasa, el uso continuo y las coladeras pueden convertir un olor escondido en un problema que percibe el cliente.',
    items: ['Cocina', 'Coladera', 'Tubería', 'Zona de lavado'],
    href: 'https://wa.me/529993577687?text=Hola,%20tengo%20un%20problema%20de%20mal%20olor%20en%20mi%20restaurante'
  }
};

const contextButtons = [...document.querySelectorAll('[data-context]')];
function selectContext(key) {
  const data = contextData[key];
  if (!data) return;
  document.querySelector('[data-context-label]').textContent = data.label;
  document.querySelector('[data-context-title]').innerHTML = data.title.replace('\n', '<br />');
  document.querySelector('[data-context-copy]').textContent = data.copy;
  document.querySelector('[data-context-list]').innerHTML = data.items.map(item => `<li>${item}</li>`).join('');
  document.querySelector('[data-context-cta]').href = data.href;
  contextButtons.forEach(button => {
    const active = button.dataset.context === key;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
}
contextButtons.forEach(button => button.addEventListener('click', () => selectContext(button.dataset.context)));

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const link = target?.closest?.('a[href]');
  const href = link?.getAttribute('href') || '';

  if (!/^(https?:)?\/\/(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(href)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'generate_lead',
    lead_method: 'whatsapp',
    page_path: window.location.pathname,
    link_text: (link.textContent || link.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    link_url: href
  });
});

if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal-block').forEach(node => observer.observe(node));
} else {
  document.querySelectorAll('.reveal-block').forEach(node => node.classList.add('is-visible'));
}
