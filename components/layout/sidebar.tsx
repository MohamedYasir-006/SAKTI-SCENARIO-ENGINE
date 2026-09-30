import Link from "next/link";
import { Navigation } from "./navigation";

export function Sidebar(): React.JSX.Element {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-primary-950 text-slate-100 md:block">
      <div className="border-b border-white/10 p-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          IP-SAKTI
          <span className="block text-xs font-normal text-slate-400">
            Scenario Engine
          </span>
        </Link>
      </div>
      <Navigation />
    </aside>
  );
}
