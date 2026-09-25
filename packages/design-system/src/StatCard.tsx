interface Props {
  label: string;
  value: string;
  delta?: string;
  color?: string;
  note?: string;
}

export function StatCard({ label, value, delta, color, note }: Props) {
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-[14px] p-[18px]">
      <div className="text-xs text-[var(--color-text-muted)] font-semibold">{label}</div>
      <div className="font-mono text-2xl font-semibold mt-1.5" style={color ? { color } : undefined}>
        {value}
      </div>
      {delta && (
        <div className="text-xs mt-2 font-semibold" style={{ color: color || "var(--color-text-muted)" }}>
          {delta}
        </div>
      )}
      {note && <div className="text-[11px] text-[var(--color-text-faint)] mt-1">{note}</div>}
    </div>
  );
}
