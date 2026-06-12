/* Test ortamı için next/link ve next/navigation stub'ları (vitest alias). */
import React from "react";

export function LinkStub({
  href,
  children,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
export default LinkStub;

export const usePathname = () => "/";
export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  back: () => {},
});
export const useSearchParams = () => new URLSearchParams();
