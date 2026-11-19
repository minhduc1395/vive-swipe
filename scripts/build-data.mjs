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

function timLogoThuongHieu(publicDir, slug) {
  if (!slug) return null;
  for (const ext of ["png", "webp", "svg"]) {
    const filePath = path.join(publicDir, "brand", "thuong-hieu", `${slug}.${ext}`);
    if (fs.existsSync(filePath)) {
      return `/brand/thuong-hieu/${slug}.${ext}`;
    }
  }
  return null;
}

export function buildStaticData({
  csvPath = path.join(ROOT, "data", "products.csv"),
  yamlPath = path.join(ROOT, "data", "deals.yaml"),
  doanhNghiepPath = path.join(ROOT, "data", "doanh-nghiep.yaml"),
  chienDichDir = path.join(ROOT, "data", "chien-dich"),
  trangChuPath = path.join(ROOT, "data", "chien-dich", "trang-chu.yaml"),
  publicDir = path.join(ROOT, "public"),
  outDir = path.join(ROOT, "lib", "data"),
} = {}) {
  const {
    parseProductsCsv,
    parseDealsYaml,
    parseDoanhNghiepYaml,
    parseTrangChuYaml,
  } = loadParseModule();

  const csvText = fs.readFileSync(csvPath, "utf8");
  const products = parseProductsCsv(csvText);

  const yamlText = fs.readFileSync(yamlPath, "utf8");
  const deals = parseDealsYaml(yamlText);

  const doanhNghiepText = fs.readFileSync(doanhNghiepPath, "utf8");
  const doanhNghiep = parseDoanhNghiepYaml(doanhNghiepText);

  const yaml = require("js-yaml");
  const chienDichList = [];
  if (fs.existsSync(chienDichDir)) {
    const files = fs.readdirSync(chienDichDir);
    for (const file of files) {
      if (file === "trang-chu.yaml" || file === "trang-chu.yml") continue;
      if (file.endsWith(".yaml") || file.endsWith(".yml")) {
        const content = fs.readFileSync(path.join(chienDichDir, file), "utf8");
        const cd = yaml.load(content);
        if (cd && cd.ma) {
          chienDichList.push(cd);
        }
      }
    }
  }
  chienDichList.sort((a, b) => (b.uu_tien || 0) - (a.uu_tien || 0));

  let trangChu = null;
  if (fs.existsSync(trangChuPath)) {
    const trangChuText = fs.readFileSync(trangChuPath, "utf8");
    trangChu = parseTrangChuYaml(trangChuText);
    trangChu.thuong_hieu.danh_sach = trangChu.thuong_hieu.danh_sach.map((th) => {
      if (th.logo) return th;
      const detected = timLogoThuongHieu(publicDir, th.logo_slug);
      return detected ? { ...th, logo: detected } : th;
    });
  }

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
  fs.writeFileSync(
    path.join(outDir, "chien-dich.json"),
    `${JSON.stringify(chienDichList, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(outDir, "doanh-nghiep.json"),
    `${JSON.stringify(doanhNghiep, null, 2)}\n`,
    "utf8"
  );
  if (trangChu) {
    fs.writeFileSync(
      path.join(outDir, "trang-chu.json"),
      `${JSON.stringify(trangChu, null, 2)}\n`,
      "utf8"
    );
  }

  return { products, deals, chienDichList, doanhNghiep, trangChu };
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
