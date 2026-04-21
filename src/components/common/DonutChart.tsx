export function DonutChart({ value, max, size = 96, stroke = 8 }: { value: number; max: number; size?: number; stroke?: number }) {
  const safeMax = Math.max(0, max);
  const ratio = safeMax === 0 ? 0 : Math.min(1, value / safeMax);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * ratio;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E3ECE4" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#00A19B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-extrabold leading-none text-ink-900">{safeMax === 0 ? "-" : value}</span>
        <span className="text-[11px] text-ink-400">{safeMax === 0 ? "" : `de ${safeMax}`}</span>
      </div>
    </div>
  );
}
