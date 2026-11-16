"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { goDesktopOrWebHome, isNexusDesktop } from "@/lib/nexus-desktop";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    setDesktop(isNexusDesktop());
  }, []);

  const classNames = cn(
    "group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    className,
  );

  const content = (
    <>
      <BrandMark className="transition-transform duration-200 group-hover:scale-[1.04]" />
      <span className="text-sm font-semibold tracking-tight">
        Nexus <span className="text-muted-foreground">Stream</span>
      </span>
    </>
  );

  if (desktop) {
    return (
      <button
        type="button"
        aria-label="Nexus Stream — voltar ao launcher"
        className={classNames}
        onClick={() => {
          void goDesktopOrWebHome();
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Nexus Stream — página inicial"
      className={classNames}
    >
      {content}
    </Link>
  );
}
