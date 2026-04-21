import { djb2Hash, getInitials } from "@/utils/initials";

const palette = ["#00A19B", "#127A4B", "#1F7A8C", "#2B6CB0", "#7C3AED", "#C05621", "#9E7A2A", "#B83280", "#E53E3E", "#4A5568"];

export function AvatarInitials({ nome, size = 52 }: { nome: string; size?: number }) {
  const bg = palette[djb2Hash(nome) % palette.length];
  return (
    <div
      aria-label={`Avatar de ${nome}`}
      className="inline-flex items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: `${Math.round(size * 0.34)}px` }}
    >
      {getInitials(nome)}
    </div>
  );
}
