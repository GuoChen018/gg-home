// One shared highlight that glides between items instead of each item fading its own background.
// `container` must be position: relative and contain `pill` plus the items.
export function initHoverPill(
  container: HTMLElement,
  pill: HTMLElement,
  items: Iterable<HTMLElement>,
  { pressable = false } = {},
) {
  const itemList = [...items];
  let current: HTMLElement | null = null;

  const offsetWithin = (el: HTMLElement) => {
    const c = container.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  };

  const moveTo = (item: HTMLElement) => {
    current = item;
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
  const hide = () => {
    current = null;
    pill.classList.remove('visible', 'pressed');
  };

  const itemFrom = (target: EventTarget | null) =>
    itemList.find((item) => target instanceof Node && item.contains(target)) ?? null;

  // Follow whatever is under the pointer on every move, so a missed enter event can't leave it stuck
  container.addEventListener('pointermove', (e) => {
    const item = itemFrom(e.target);
    if (item && item !== current) moveTo(item);
  });
  container.addEventListener('pointerleave', hide);

  // Keyboard focus only; mouse clicks and window refocus shouldn't drag the highlight around
  container.addEventListener('focusin', (e) => {
    const item = itemFrom(e.target);
    if (item && (e.target as HTMLElement).matches(':focus-visible')) moveTo(item);
  });
  container.addEventListener('focusout', () => {
    if (!container.matches(':hover')) hide();
  });

  if (pressable) {
    container.addEventListener('pointerdown', (e) => {
      const item = itemFrom(e.target);
      if (!item) return;
      moveTo(item);
      pill.classList.add('pressed');
    });
    const release = () => pill.classList.remove('pressed');
    ['pointerup', 'pointercancel'].forEach((type) => container.addEventListener(type, release));
  }

  // Page swapped in under a stationary cursor: pick up the hovered item right away
  const hovered = itemList.find((item) => item.matches(':hover'));
  if (hovered) moveTo(hovered);
}
