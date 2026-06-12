import "@testing-library/jest-dom/vitest";

/* next/link ve next/navigation, vitest.config.ts'te next-stubs.tsx'e alias'lanır. */

/* jsdom eksikleri */
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
