import { element } from '../lib/dom.js';
import { language, t } from '../lib/locale.js';
import { linkToSpecs } from '../lib/specs.js';
import { formatPrice, getProductName, getProductPrice } from '../lib/storefront.js';
import { findProduct } from '../data/products.js';

// Feature copy comes from the V70 "Why choose HANDYPAD?" section, shortened to card length.
const FEATURES = [
  { icon: 'flame', title: 'Fireproof canvas', body: 'Flame-retardant outer canvas for hot-works zones — welding, grinding and cutting decks.' },
  { icon: 'shield', title: 'Closed-cell foam sleeve', body: "Wraps couplers and tube ends so straps, tarps and hands don't meet a sharp edge." },
  { icon: 'eye', title: 'Reflective tape', body: '3M-grade reflective strip keeps scaffold visible on low-light and night shifts.' },
  { icon: 'stitch', title: 'Durable stitching', body: 'Sewn, not glued — holds up through repeated strip-downs and re-erects.' },
];

// Each photo is paired with the pad it shows (the coupler photo shows the 1 Metre so all three sizes appear).
const PHOTOS = [
  { slot: 'main', file: 'scaffold-pads.webp', width: 1254, height: 1254, alt: 'HANDYPAD pads fitted to scaffold tubes and couplers', size: 'single' },
  { slot: 'worker', file: 'worker-pad.jpg', width: 403, height: 403, alt: 'Worker on scaffold next to a HANDYPAD pad', size: 'double' },
  { slot: 'coupler', file: 'coupler.webp', width: 1430, height: 1080, alt: 'Worker tightening a scaffold coupler', size: 'one_metre' },
];

function createPhotoTile(photo) {
  const product = findProduct(photo.size);
  const name = getProductName(product, language);
  const price = getProductPrice(product, language);
  const tile = element('button', `feature-tile feature-tile--${photo.slot}`);
  tile.type = 'button';
  tile.dataset.size = photo.size;
  tile.setAttribute('aria-label', `${t(photo.alt)}. ${t('Order this pad')}: ${name}, ${t('from')} ${formatPrice(price.amount, price.currency)}`);
  const picture = element('img', 'feature-photo');
  picture.src = `./src/assets/products/handypad/why/${photo.file}`;
  picture.alt = '';
  picture.width = photo.width;
  picture.height = photo.height;
  picture.loading = 'lazy';
  picture.decoding = 'async';
  const shot = element('img', 'feature-tile-product');
  shot.src = product.image_url;
  shot.alt = '';
  shot.width = 800;
  shot.height = 800;
  shot.loading = 'lazy';
  shot.decoding = 'async';
  const label = element('span', 'feature-tile-label');
  label.append(element('span', 'feature-tile-name', name.replace(/^HANDYPAD /, '')), element('span', 'feature-tile-price', `${t('from')} ${formatPrice(price.amount, price.currency)}`));
  label.setAttribute('aria-hidden', 'true');
  tile.append(picture, shot, label);
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
  // Hover / keyboard focus reveals the related pad with its price; clicking orders it.
  // Touch has no hover, so the first tap reveals and a second tap orders.
  const visual = element('figure', 'feature-section-visual');
  const tiles = PHOTOS.map(photo => createPhotoTile(photo));
  visual.append(...tiles);
  visual.addEventListener('pointerdown', event => { visual.dataset.pointer = event.pointerType; });
  visual.addEventListener('click', event => {
    const tile = event.target.closest('.feature-tile');
    if (!tile) return;
    const touch = ['touch', 'pen'].includes(visual.dataset.pointer);
    if (touch && !tile.classList.contains('is-revealed')) {
      tiles.forEach(other => other.classList.toggle('is-revealed', other === tile));
      return;
    }
    tiles.forEach(other => other.classList.remove('is-revealed'));
    window.dispatchEvent(new CustomEvent('handypad:configure', { detail: { size: tile.dataset.size, reflective: false } }));
  });
  // A tap elsewhere puts a revealed tile back to its photo.
  document.addEventListener('pointerdown', event => {
    if (!visual.contains(event.target)) tiles.forEach(tile => tile.classList.remove('is-revealed'));
  });

  inner.append(visual, copy);
  section.append(inner);
  return section;
}
