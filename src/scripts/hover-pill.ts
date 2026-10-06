// One shared highlight that glides between items instead of each item fading its own background.
// `container` must be position: relative and contain `pill` plus the items.
export function initHoverPill(
  container: HTMLElement,
  pill: HTMLElement,
  items: Iterable<HTMLElement>,
  { pressable = false } = {},
) {
  const offsetWithin = (el: HTMLElement) => {
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  };

  const moveTo = (item: HTMLElement) => {
    const visible = pill.classList.contains('visible');
    const { x, y, w, h } = offsetWithin(item);
    if (!visible) pill.classList.add('no-slide');
    pill.style.width = `${w}px`;
    pill.style.height = `${h}px`;
    // `translate` (not `transform`) so the press `scale` shrinks around the pill's own center
    pill.style.translate = `${x}px ${y}px`;
    if (!visible) {
      pill.getBoundingClientRect();
      pill.classList.remove('no-slide');
    }
    pill.classList.add('visible');
  };
  const hide = () => pill.classList.remove('visible');

  for (const item of items) {
    item.addEventListener('pointerenter', () => moveTo(item));
    item.addEventListener('focusin', () => moveTo(item));
    item.addEventListener('focusout', hide);
    if (pressable) {
      item.addEventListener('pointerdown', () => {
        moveTo(item);
        pill.classList.add('pressed');
      });
    }
  }
  container.addEventListener('pointerleave', hide);

  if (pressable) {
    const release = () => pill.classList.remove('pressed');
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => container.addEventListener(type, release));
  }
}
