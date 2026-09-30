export function Header({ title }: { title: string }): React.JSX.Element {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold text-primary-900">{title}</h1>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
          Phase 1 — Architecture
        </span>
      </div>
    </header>
  );
}
