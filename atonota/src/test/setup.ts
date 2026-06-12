import "@testing-library/jest-dom/vitest";

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver ??= RO;
Element.prototype.scrollIntoView ??= () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Element.prototype as any).scrollTo ??= () => {};
