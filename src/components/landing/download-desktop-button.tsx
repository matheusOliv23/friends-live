"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { isNexusDesktop } from "@/lib/nexus-desktop";
import { cn } from "@/lib/utils";

interface DownloadDesktopButtonProps {
  className?: string;
}

export function DownloadDesktopButton({
  className,
}: DownloadDesktopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!isNexusDesktop());
  }, []);

  if (!visible) return null;

  return (
    <a
      href="/api/desktop/download"
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-11 gap-2 px-5 text-sm transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <Download data-icon="inline-start" />
      Baixar para Windows
    </a>
  );
}
