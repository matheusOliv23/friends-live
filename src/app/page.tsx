import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <SiteHeader className="mx-auto w-full max-w-5xl">
        <Link href="/watch" className={buttonVariants({ variant: "ghost" })}>
          Assistir
        </Link>
      </SiteHeader>
      <main className="flex flex-1 flex-col">
        <Hero />
      </main>
      <footer className="animate-rise border-t py-6 text-center text-xs text-muted-foreground">
        Nexus Stream — transmissão privada de tela.
      </footer>
    </>
  );
}
