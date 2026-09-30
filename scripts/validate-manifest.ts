/**
 * Validate the corpus manifest and print counts.
 *
 * Usage: pnpm manifest:validate [--manifest <path>]
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { countManifest, loadManifestFile } from "../lib/evidence/manifest";

function resolveManifestArg(argv: string[]): string {
  const flagIndex = argv.indexOf("--manifest");
  if (flagIndex >= 0 && argv[flagIndex + 1]) {
    return path.resolve(argv[flagIndex + 1]);
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "..", "data", "evidence", "manifest.json");
}

function printCounts(title: string, counts: Record<string, number>): void {
  console.log(title);
  const keys = Object.keys(counts).sort();
  if (keys.length === 0) {
    console.log("  (none)");
    return;
  }
  for (const key of keys) {
    console.log(`  ${key}: ${counts[key]}`);
  }
}

async function main(): Promise<void> {
  const manifestPath = resolveManifestArg(process.argv.slice(2));
  const { manifest, errors } = await loadManifestFile(manifestPath);
  if (!manifest) {
    console.error(`Manifest INVALID: ${manifestPath}`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }
  const counts = countManifest(manifest);
  console.log(`Manifest OK: ${manifestPath}`);
  console.log(`  manifestVersion: ${manifest.manifestVersion}`);
  console.log(`  total items: ${counts.total}`);
  printCounts("  per source category:", counts.perCategory);
  printCounts("  per jurisdiction:", counts.perJurisdiction);
}

void main();
