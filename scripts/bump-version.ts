import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type BumpType = "patch" | "minor" | "major";

function parseSemver(version: string): [number, number, number, string] {
  const clean = version.trim().replace(/^v/, "");
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!match) {
    throw new Error(`Invalid semver version: "${version}"`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] || ""];
}

function calculateNextVersion(current: string, arg: string): string {
  const [major, minor, patch] = parseSemver(current);

  if (arg === "patch") {
    return `${major}.${minor}.${patch + 1}`;
  }
  if (arg === "minor") {
    return `${major}.${minor + 1}.0`;
  }
  if (arg === "major") {
    return `${major + 1}.0.0`;
  }

  // Explicit version provided
  const cleanExplicit = arg.trim().replace(/^v/, "");
  parseSemver(cleanExplicit); // validates format
  return cleanExplicit;
}

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: bun run bump <patch|minor|major|x.y.z>");
    console.error("Examples:");
    console.error("  bun run bump patch   # 0.1.0 -> 0.1.1");
    console.error("  bun run bump minor   # 0.1.0 -> 0.2.0");
    console.error("  bun run bump major   # 0.1.0 -> 1.0.0");
    console.error("  bun run bump 0.2.5   # set exact version");
    process.exit(1);
  }

  const rootDir = process.cwd();
  const pkgPath = resolve(rootDir, "package.json");
  const cargoPath = resolve(rootDir, "src-tauri/Cargo.toml");

  // 1. Read current version from package.json
  const pkgContent = readFileSync(pkgPath, "utf-8");
  const pkgJson = JSON.parse(pkgContent);
  const currentVersion = pkgJson.version as string;

  if (!currentVersion) {
    throw new Error('package.json does not contain a "version" field.');
  }

  const newVersion = calculateNextVersion(currentVersion, arg);

  if (newVersion === currentVersion) {
    console.log(`Version is already ${currentVersion}. Nothing to bump.`);
    return;
  }

  // 2. Update package.json
  pkgJson.version = newVersion;
  writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, "utf-8");

  // 3. Update src-tauri/Cargo.toml (only under [package])
  let cargoContent = readFileSync(cargoPath, "utf-8");
  const cargoPackageRegex = /(\[package\][\s\S]*?^version\s*=\s*)"[^"]+"/m;
  if (!cargoPackageRegex.test(cargoContent)) {
    throw new Error('Could not find version = "..." under [package] in Cargo.toml');
  }
  cargoContent = cargoContent.replace(cargoPackageRegex, `$1"${newVersion}"`);
  writeFileSync(cargoPath, cargoContent, "utf-8");

  console.log(`\n🎉 Successfully bumped version: \x1b[33mv${currentVersion}\x1b[0m → \x1b[32mv${newVersion}\x1b[0m\n`);
  console.log("Updated files:");
  console.log("  ✓ package.json");
  console.log("  ✓ src-tauri/Cargo.toml");
  console.log("  ✓ src-tauri/tauri.conf.json (auto-synced via \"../package.json\")\n");
  console.log("Next recommended Git commands:");
  console.log(`  git commit -am "chore: release v${newVersion}"`);
  console.log(`  git tag v${newVersion}`);
  console.log(`  git push origin main --tags\n`);
}

main();
