import { element, productImage } from '../lib/dom.js';
import { language, t } from '../lib/locale.js';
import { formatPrice, getProductName, getProductPrice } from '../lib/storefront.js';
import { RANGE } from '../data/products.js';

const SPEED_PX_PER_SECOND = 22;
const DRAG_THRESHOLD = 6;

function createCard(product, { decorative }) {
  const card = element('button', 'range-card');
  card.type = 'button';
  card.dataset.size = product.size;
  card.dataset.reflective = String(product.reflective);
  if (decorative) card.tabIndex = -1;
  const price = getProductPrice(product, language);
  const copy = element('span', 'range-card-copy');
  copy.append(
    element('span', 'range-card-name', getProductName(product, language)),
    element('span', 'range-card-meta', product.dimensions_display),
    element('span', 'range-card-price', `${t('from')} ${formatPrice(price.amount, price.currency)}`),
  );
  card.append(productImage(product, { eager: !decorative }), copy);
  card.setAttribute('aria-label', `${t('Order this pad')}: ${getProductName(product, language)}, ${product.dimensions_display}`);
  return card;
}

export function createProductRange() {
  const section = element('section', 'product-range');
  section.id = 'product-range';
  section.setAttribute('aria-labelledby', 'product-range-title');
  const heading = element('div', 'container section-heading');
  const title = element('h2', 'section-eyebrow', t('PRODUCT RANGE'));
  title.id = 'product-range-title';
  title.tabIndex = -1;
  heading.append(title);

  const marquee = element('div', 'range-marquee');
  marquee.setAttribute('role', 'group');
  marquee.setAttribute('aria-label', t('HANDYPAD product range'));
  const track = element('div', 'range-track');
  const groups = [false, true].map(decorative => {
    const group = element('div', 'range-group');
    if (decorative) group.setAttribute('aria-hidden', 'true');
    RANGE.forEach(product => group.append(createCard(product, { decorative })));
    track.append(group);
    return group;
  });
  marquee.append(track);
  section.append(heading, marquee);

  // Continuous slow glide; the customer can pause (hover/focus) or drag it by hand.
  // It keeps moving even when the OS reports reduced motion (e.g. Windows "Animation
  // effects" off): the motion is slow and stops as soon as the pointer is over it.
  let offset = 0, loopWidth = 0, lastTime = performance.now();
  let hovering = false, focused = false, dragging = false, resumeAt = 0;
  const wrap = value => loopWidth > 0 ? ((value % loopWidth) + loopWidth) % loopWidth : value;
  const render = () => { track.style.transform = `translate3d(${-offset}px, 0, 0)`; };
  const measure = () => { loopWidth = groups[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0); offset = wrap(offset); render(); };
  const tick = now => {
    const elapsed = Math.min((now - lastTime) / 1000, .08);
    lastTime = now;
    if (!hovering && !focused && !dragging && now >= resumeAt && !document.hidden && loopWidth > 0) {
      offset = wrap(offset + SPEED_PX_PER_SECOND * elapsed);
      render();
    }
    requestAnimationFrame(tick);
  };

  let pointerId = null, startX = 0, startOffset = 0, suppressClick = false;
  marquee.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerId = event.pointerId; startX = event.clientX; startOffset = offset; suppressClick = false;
  });
  marquee.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const delta = event.clientX - startX;
    if (!dragging && Math.abs(delta) >= DRAG_THRESHOLD) {
      // Only a real drag captures the pointer, so a plain click still reaches the card.
      dragging = true; suppressClick = true;
      marquee.classList.add('is-dragging');
      marquee.setPointerCapture(pointerId);
    }
    if (dragging) { offset = wrap(startOffset - delta); render(); }
  });
  const endDrag = event => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging) return;
    dragging = false;
    marquee.classList.remove('is-dragging');
    resumeAt = performance.now() + (event.pointerType === 'mouse' ? 0 : 1500);
    lastTime = performance.now();
  };
  marquee.addEventListener('pointerup', endDrag);
  marquee.addEventListener('pointercancel', endDrag);
  marquee.addEventListener('dragstart', event => event.preventDefault());
  marquee.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; return; }
    const card = event.target.closest('.range-card');
    if (!card) return;
    window.dispatchEvent(new CustomEvent('handypad:configure', { detail: { size: card.dataset.size, reflective: card.dataset.reflective === 'true' } }));
  }, true);
  marquee.addEventListener('mouseenter', () => { hovering = true; });
  marquee.addEventListener('mouseleave', () => { hovering = false; lastTime = performance.now(); });
  // Keyboard users: pause and bring the focused card fully into view.
  marquee.addEventListener('focusin', event => {
    const card = event.target.closest('.range-card');
    if (!card || !card.matches(':focus-visible')) return; // A mouse click is not keyboard browsing.
    focused = true;
    const box = marquee.getBoundingClientRect(), cardBox = card.getBoundingClientRect();
    if (cardBox.left < box.left || cardBox.right > box.right) {
      offset = wrap(offset + cardBox.left - box.left - (box.width - cardBox.width) / 2);
      render();
    }
  });
  marquee.addEventListener('focusout', event => { if (!marquee.contains(event.relatedTarget)) { focused = false; lastTime = performance.now(); } });

  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(groups[0]);
  addEventListener('resize', measure, { passive: true });
  requestAnimationFrame(() => { measure(); requestAnimationFrame(tick); });
  return section;
}
