interface Segment {
  value: number;
  color: string;
}

export function SegmentedProgressBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="flex h-[6px] w-full overflow-hidden rounded-pill bg-ink-100">
      {segments.map((segment, index) => {
        const width = total === 0 ? 0 : (segment.value / total) * 100;
        return <span key={`${segment.color}-${index}`} style={{ width: `${width}%`, backgroundColor: segment.color }} />;
      })}
    </div>
  );
}
