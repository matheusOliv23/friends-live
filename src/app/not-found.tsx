import Link from "next/link";
import { Unlink } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <EmptyState
          icon={Unlink}
          title="Link não encontrado"
          description="Este endereço não existe ou o link da transmissão está incorreto."
        >
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Voltar ao início
          </Link>
        </EmptyState>
      </main>
    </>
  );
}
