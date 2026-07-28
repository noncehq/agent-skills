import { defineConfig } from "vite-plus";
import type { PackUserConfig } from "vite-plus/pack";

const scriptEntries = {
  auth: "src/skill-scripts/auth.ts",
  "bootstrap-runtime": "src/skill-scripts/bootstrap-runtime.ts",
  "run-task": "src/skill-scripts/run-task.ts",
  "skill-runtime": "src/runtime/index.ts",
} as const;

const checkIgnorePatterns = [
  "skills/nonce/assets/tool-signatures.ts",
  "skills/nonce/assets/tool-manifest.json",
  "skills/nonce/assets/tool-schemas.json",
  "skills/nonce/assets/schemas/*.md",
  "skills/nonce/references/tool-signatures.md",
  "skills/nonce/scripts/**/*.mjs",
  "skills/reboot-report/assets/template.html",
];

const createScriptPack = ([name, entry]: [string, string]): PackUserConfig => ({
  clean: [`skills/nonce/scripts/${name}.mjs`, `skills/nonce/scripts/${name}.js`],
  dts: false,
  deps: {
    onlyBundle: false,
  },
  entry: {
    [name]: entry,
  },
  fixedExtension: true,
  format: "esm",
  minify: true,
  name: `nonce-${name}`,
  outDir: "skills/nonce/scripts",
});

export default defineConfig({
  fmt: {
    ignorePatterns: checkIgnorePatterns,
    lineWidth: 120,
    quotes: "single",
    semicolons: false,
    trailingCommas: "all",
  },
  pack: Object.entries(scriptEntries).map(createScriptPack),
  lint: {
    ignorePatterns: checkIgnorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      build: {
        cache: false,
        command: ["vp pack", "vp run generate:nonce-sdk"],
      },
      "archive:skills": {
        cache: false,
        command: ["rm -f nonce-skills.zip", "zip -X -r -q nonce-skills.zip skills"],
        dependsOn: ["build"],
      },
      "generate:nonce-sdk": {
        cache: false,
        command: "node --import tsx/esm scripts/generate-nonce-sdk.ts",
      },
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
  },
});
