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
      <span className="text-xs font-semibold tracking-wide text-zinc-400">
        {label}
        {required && <span className="text-fail"> *</span>}
      </span>
      {hint && <span className="-mt-1 text-[11px] text-zinc-500">{hint}</span>}
      {children}
    </label>
  );
}
