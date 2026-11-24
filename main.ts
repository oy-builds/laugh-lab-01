import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Fallback copy of the entry, used only if entry.txt is missing beside
// this script. entry.txt is the source of truth when it is present.
const FALLBACK =
  "You told me to pick up everything on the floor. I picked up the sock. Nobody mentioned giving anything back.";

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = join(here, "entry.txt");
  if (existsSync(file)) {
    const text = readFileSync(file, "utf8").trim();
    if (text.length > 0) return text;
  }
  return FALLBACK;
}

const entry = loadEntry();

// Hold the entry to the competition gate before writing anything:
// UTF-8 text of 1 to 200 characters, not only white space.
if (entry.trim().length === 0 || entry.length > 200) {
  throw new Error(
    `entry fails the gate: ${entry.length} chars (need 1-200, non-blank)`,
  );
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", entry, "utf8");

// Read back what landed on disk and verify it byte for byte, so a
// truncated or corrupted write fails loudly instead of being judged.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== entry) {
  throw new Error("read-back mismatch: /output/entry.txt differs from the entry");
}
console.log(`wrote /output/entry.txt (${entry.length} chars, verified)`);
