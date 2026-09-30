"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buildDemoModel } from "@/lib/demo/demo-loader";
import { saveInnovation } from "@/lib/scenario/storage";
import demoInnovationJson from "@/data/demo/ashwabrahm/innovation.json";

/**
 * One-click demo loader: builds the AshwaBrahm demo innovation from the
 * demo JSON file, validates it, stores it, and opens /analysis with results.
 */
export function DemoLoaderButton({
  label = "Load demo: AshwaBrahm",
  size = "default",
  variant = "outline",
}: {
  label?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "ghost" | "accent";
}): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleClick(): void {
    const result = buildDemoModel(demoInnovationJson);
    if (!result.valid) {
      setError(result.errors.map((e) => `${e.path}: ${e.message}`).join("; "));
      return;
    }
    setError(null);
    saveInnovation(result.value);
    router.push("/analysis?demo=1");
  }

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <Button size={size} variant={variant} onClick={handleClick}>
        {label}
      </Button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </span>
  );
}
