// This script is Only for testing the slug generation and validation functions.
// Run it with: `ts-node scripts/test-slug.ts`

import {
  generateSlug,
  validateSlug,
  isSlugAvailable,
  generateUniqueSlug,
} from "@/lib/slug";

async function main() {
  console.log("\n── generateSlug ──────────────────────────");
  for (let i = 0; i < 5; i++) {
    console.log(" ", generateSlug());
  }

  console.log("\n── validateSlug ──────────────────────────");
  const cases = [
    "github",
    "my-link",
    "ab",
    "this-slug-is-way-too-long-for-the-app",
    "UPPERCASE",   
    "has space",
    "-starts-with",
    "dashboard",
  ];
  for (const c of cases) {
    const result = validateSlug(c);
    console.log(`  "${c}" →`, result.valid ? "valid" : `invalid: ${result.error}`);
  }

  console.log("\n── isReserved ────────────────────────────");
  console.log("  dashboard →", validateSlug("dashboard")); // true
  console.log("  my-link   →", validateSlug("my-link"));   // false

  console.log("\n── isSlugAvailable ───────────────────────");
  console.log("  xk29fq →", await isSlugAvailable("xk29fq")); // depends on your seed data

  console.log("\n── generateUniqueSlug ────────────────────");
  const unique = await generateUniqueSlug();
  console.log("  generated:", unique);

  console.log("\n done\n");
}

main().catch(console.error);