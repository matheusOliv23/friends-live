"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { goDesktopOrWebHome, isNexusDesktop } from "@/lib/nexus-desktop";

interface HomeLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  children: ReactNode;
  href?: string;
}

/** Link pra home do site, ou launcher Electron quando `nexusDesktop` existir. */
export function HomeLink({
  children,
  className,
  href = "/",
  ...props
}: HomeLinkProps) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    setDesktop(isNexusDesktop());
  }, []);

  if (desktop) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          void goDesktopOrWebHome();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
