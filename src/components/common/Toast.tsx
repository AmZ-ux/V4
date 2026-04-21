interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Toast({ message, actionLabel, onAction }: ToastProps) {
  return (
    <div className="fixed left-1/2 top-4 z-[70] flex w-[calc(100%-24px)] max-w-[456px] -translate-x-1/2 items-center justify-between gap-3 rounded-pill bg-ink-900 px-4 py-2 text-[13px] font-semibold text-white shadow-card-hi">
      <span>{message}</span>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="shrink-0 text-[13px] font-bold text-brand-200">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
