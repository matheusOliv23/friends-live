import { Link2, MonitorPlay, MonitorUp, type LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: readonly Step[] = [
  {
    icon: MonitorUp,
    title: "Inicie a transmissão",
    description: "Escolha a tela, janela ou aba que deseja compartilhar.",
  },
  {
    icon: Link2,
    title: "Envie o link",
    description: "Compartilhe o link privado apenas com quem você quiser.",
  },
  {
    icon: MonitorPlay,
    title: "Assistam juntos",
    description: "Seus amigos acompanham tudo em tempo real pelo navegador.",
  },
];

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6"
    >
      <h2
        id="how-it-works-title"
        className="animate-rise text-center text-xs font-medium tracking-widest text-muted-foreground uppercase"
      >
        Como funciona
      </h2>
      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className={`animate-rise group rounded-xl border bg-surface/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface hover:shadow-[0_20px_40px_-28px_rgba(139,92,246,0.55)] stagger-${index + 1}`}
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-raised text-primary ring-1 ring-border transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/40">
                <step.icon
                  className="size-4 transition-transform duration-300 group-hover:-rotate-6"
                  aria-hidden
                />
              </span>
              <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-primary">
                0{index + 1}
              </span>
            </div>
            <h3 className="mt-5 text-sm font-medium">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
