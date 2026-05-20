export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold tracking-wide text-kitchen-ink">
        {label}
        {required && <span className="text-kitchen"> *</span>}
      </span>
      {hint && <span className="-mt-1 text-[11px] text-kitchen-muted">{hint}</span>}
      {children}
    </label>
  );
}
