import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-600">
          SIH26045
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary-900">
          IP-SAKTI Scenario Engine
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          Evidence-grounded innovation intelligence for Ayurveda.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg">Start Innovation Analysis</Button>
          </Link>
          <Link href="/scenario-lab">
            <Button size="lg" variant="outline">
              Explore Demo
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          Phase 1 — architecture only. Product intelligence arrives in later
          phases.
        </p>
      </div>
    </main>
  );
}
