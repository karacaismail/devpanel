import "@testing-library/jest-dom/vitest";

/* jsdom'da eksik API'ler (Radix vb. için) */
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver ??= RO;

if (!window.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

Element.prototype.scrollIntoView ??= () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Element.prototype as any).scrollTo ??= () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Element.prototype as any).hasPointerCapture ??= () => false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Element.prototype as any).setPointerCapture ??= () => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Element.prototype as any).releasePointerCapture ??= () => {};
