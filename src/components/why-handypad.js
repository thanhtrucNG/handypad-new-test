import { element } from '../lib/dom.js';
import { t } from '../lib/locale.js';
import { linkToSpecs } from '../lib/specs.js';

// Feature copy comes from the V70 "Why choose HANDYPAD?" section, shortened to card length.
const FEATURES = [
  { icon: 'flame', title: 'Fireproof canvas', body: 'Flame-retardant outer canvas for hot-works zones — welding, grinding and cutting decks.' },
  { icon: 'shield', title: 'Closed-cell foam sleeve', body: "Wraps couplers and tube ends so straps, tarps and hands don't meet a sharp edge." },
  { icon: 'eye', title: 'Reflective tape', body: '3M-grade reflective strip keeps scaffold visible on low-light and night shifts.' },
  { icon: 'stitch', title: 'Durable stitching', body: 'Sewn, not glued — holds up through repeated strip-downs and re-erects.' },
];

// Each photo reveals a slogan picture (1440×1080, English lettering; shown on both EN and VI pages).
const PHOTOS = [
  { slot: 'main', file: 'scaffold-pads.webp', width: 1254, height: 1254, alt: 'HANDYPAD pads fitted to scaffold tubes and couplers',
    slogan: 'slogan-protection.webp', sloganAlt: 'HANDYPAD impact protection for safer worksites.' },
  { slot: 'worker', file: 'worker-pad.jpg', width: 403, height: 403, alt: 'Worker on scaffold next to a HANDYPAD pad',
    slogan: 'slogan-risks.webp', sloganAlt: 'Reducing impact risks on site to people & equipment.' },
  { slot: 'coupler', file: 'coupler.webp', width: 1430, height: 1080, alt: 'Worker tightening a scaffold coupler',
    slogan: 'slogan-safer.webp', sloganAlt: 'Helping you build safer worksites with HANDYPAD.' },
];

function tileImage(className, file, alt, width, height) {
  const image = element('img', className);
  image.src = `./src/assets/products/handypad/why/${file}`;
  image.alt = alt;
  image.width = width;
  image.height = height;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

function createPhotoTile(photo) {
  const tile = element('div', `feature-tile feature-tile--${photo.slot}`);
  // Both images carry alt text, so screen readers get the photo and the slogan without hovering.
  tile.append(
    tileImage('feature-photo', photo.file, t(photo.alt), photo.width, photo.height),
    tileImage('feature-tile-slogan', photo.slogan, photo.sloganAlt, 1440, 1080),
  );
  return tile;
}

const ICON_PATHS = {
  flame: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.3 2.3-5.4 3.6-7.6.4 1.8 1.3 3 2.6 3.6-.2-2.9.9-5.6 3.2-7.8.2 3 1.4 4.6 2.6 6.3 1 1.5 1.5 3 1.5 4.9 0 4.2-2.9 6.8-7 6.8Z"/><path d="M12 21c-1.8 0-3-1.2-3-2.9 0-1.6 1.2-2.6 2.1-3.8.3 1 .9 1.6 1.6 1.9.6-.8 1-1.8 1-2.9 1.1 1.2 1.7 2.5 1.7 3.9 0 2.2-1.4 3.8-3.4 3.8Z"/>',
  shield: '<path d="M12 2.8 5.4 5.3v5.1c0 4.6 2.8 8.6 6.6 10.8 3.8-2.2 6.6-6.2 6.6-10.8V5.3L12 2.8Z"/>',
  eye: '<path d="M2.3 12s3.5-5.1 9.7-5.1 9.7 5.1 9.7 5.1-3.5 5.1-9.7 5.1S2.3 12 2.3 12Z"/><circle cx="12" cy="12" r="2.7"/>',
  stitch: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M7 9h2m2.5 0h2m2.5 0h1M7 15h2m2.5 0h2m2.5 0h1"/>',
};

function createFeature(feature) {
  const card = element('article', 'feature-card');
  const icon = element('span', 'feature-card-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[feature.icon]}</svg>`;
  const copy = element('div', 'feature-card-copy');
  copy.append(element('h3', '', t(feature.title)), element('p', '', t(feature.body)));
  card.append(icon, copy);
  return card;
}

export function createWhyHandypad() {
  const section = element('section', 'feature-section');
  section.id = 'why-handypad';
  section.setAttribute('aria-labelledby', 'why-handypad-title');
  const inner = element('div', 'container feature-section-inner');

  const heading = element('div', 'feature-section-heading');
  // The red label is the section heading, as in Product Range.
  const title = element('h2', 'section-eyebrow', t('WHY HANDYPAD'));
  title.id = 'why-handypad-title';
  title.tabIndex = -1;
  heading.append(title);

  const features = element('div', 'feature-cards');
  FEATURES.forEach(feature => features.append(createFeature(feature)));

  const link = linkToSpecs(element('a', 'feature-section-link'));
  link.append(element('span', '', t('View specs')), element('span', 'feature-section-link-arrow', '→'));

  const copy = element('div', 'feature-section-copy');
  copy.append(heading, features, link);

  // Photo collage: pads in use (large) beside the worker and the bare coupler they cover.
  // Hover swaps a photo for its slogan picture; touch has no hover, so a tap toggles it.
  const visual = element('figure', 'feature-section-visual');
  const tiles = PHOTOS.map(photo => createPhotoTile(photo));
  visual.append(...tiles);
  visual.addEventListener('pointerup', event => {
    const tile = event.target.closest('.feature-tile');
    if (!tile || event.pointerType === 'mouse') return;
    const show = !tile.classList.contains('is-revealed');
    tiles.forEach(other => other.classList.toggle('is-revealed', show && other === tile));
  });
  // A tap elsewhere puts a revealed tile back to its photo.
  document.addEventListener('pointerdown', event => {
    if (!visual.contains(event.target)) tiles.forEach(tile => tile.classList.remove('is-revealed'));
  });

  inner.append(visual, copy);
  section.append(inner);
  return section;
}
