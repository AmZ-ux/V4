const items = [
  { label: "Ações", target: "acoes" },
  { label: "Gestão", target: "gestao" },
  { label: "Rotas", target: "rotas" },
  { label: "Atrasados", target: "atrasados" },
];

export function QuickAnchors() {
  const scrollTo = (target: string) => {
    const element = document.getElementById(target);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-20 -mt-2 bg-brand-50/95 px-screen py-3 backdrop-blur">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.target}
            type="button"
            onClick={() => scrollTo(item.target)}
            className="shrink-0 rounded-pill border border-ink-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-700 shadow-card"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
