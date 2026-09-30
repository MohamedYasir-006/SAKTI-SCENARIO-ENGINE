import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoLoaderButton } from "@/components/demo/demo-loader-button";

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
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/analysis">
            <Button size="lg">Start Innovation Analysis</Button>
          </Link>
          <DemoLoaderButton size="lg" label="Explore Demo" />
        </div>
        <p className="mt-8 text-xs text-slate-400">
          Working prototype with illustrative sample evidence. Not legal advice.
        </p>
      </div>
    </main>
  );
}
