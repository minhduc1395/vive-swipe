#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

function loadParseModule() {
  const esbuild = require("esbuild");
  const entry = path.join(ROOT, "lib", "data", "parse.ts");
  const result = esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["zod", "js-yaml"],
    write: false,
  });
  const code = result.outputFiles[0].text;
  const mod = { exports: {} };
  const fn = new Function(
    "exports",
    "require",
    "module",
    "__filename",
    "__dirname",
    code
  );
  fn(mod.exports, require, mod, entry, path.dirname(entry));
  return mod.exports;
}

export function buildStaticData({
  csvPath = path.join(ROOT, "data", "products.csv"),
  yamlPath = path.join(ROOT, "data", "deals.yaml"),
  outDir = path.join(ROOT, "lib", "data"),
} = {}) {
  const { parseProductsCsv, parseDealsYaml } = loadParseModule();

  const csvText = fs.readFileSync(csvPath, "utf8");
  const products = parseProductsCsv(csvText);

  const yamlText = fs.readFileSync(yamlPath, "utf8");
  const deals = parseDealsYaml(yamlText);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "products.json"),
    `${JSON.stringify(products, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(outDir, "deals.json"),
    `${JSON.stringify(deals, null, 2)}\n`,
    "utf8"
  );

  return { products, deals };
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  try {
    const { products, deals } = buildStaticData();
    console.log(
      `Đã tạo lib/data/products.json (${products.length} sản phẩm) và lib/data/deals.json (${deals.length} deal).`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Lỗi build dữ liệu tĩnh: ${msg}`);
    process.exit(1);
  }
}
