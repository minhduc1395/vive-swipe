// Đo Lighthouse mobile nhiều lần, in trung vị. Không thêm gói npm: gọi `npx lighthouse@12`.
// LH_THROTTLE=devtools: giả lập mạng/CPU thật trong trình duyệt (mặc định simulate).
// Dùng: CHROME_PATH=... node scripts/do-lighthouse.mjs <gốc-url> [số-lần=3] [đường-dẫn,...=/,/new-arrival]
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const goc = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const soLan = Number(process.argv[3] ?? 3);
const duong = (process.argv[4] ?? "/,/new-arrival").split(","); // ví dụ: "/,/new-arrival"
const thuMuc = mkdtempSync(join(tmpdir(), "lh-"));

const trungVi = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};

for (const d of duong) {
  const kq = { lcp: [], cls: [], tbt: [], perf: [], a11y: [] };
  for (let i = 0; i < soLan; i++) {
    const file = join(thuMuc, `r${duong.indexOf(d)}-${i}.json`);
    for (let thu = 0; thu < 3 && !existsSync(file); thu++) {
    spawnSync(
      "npx",
      [
        "--yes", "lighthouse@12", goc + d,
        "--chrome-flags=--headless=new --no-sandbox",
        "--form-factor=mobile", "--only-categories=performance,accessibility",
        "--output=json", `--output-path=${file}`, "--quiet",
        "--skip-audits=bf-cache",
        `--throttling-method=${process.env.LH_THROTTLE ?? "simulate"}`,
      ],
      { stdio: "ignore" }
    );
    }
    const r = JSON.parse(readFileSync(file, "utf8"));
    kq.lcp.push(r.audits["largest-contentful-paint"].numericValue / 1000);
    kq.cls.push(r.audits["cumulative-layout-shift"].numericValue);
    kq.tbt.push(r.audits["total-blocking-time"].numericValue);
    kq.perf.push(r.categories.performance.score * 100);
    kq.a11y.push(r.categories.accessibility.score * 100);
  }
  console.log(
    `${d}\tLCP ${trungVi(kq.lcp).toFixed(2)}s\tCLS ${trungVi(kq.cls).toFixed(3)}\tTBT ${Math.round(trungVi(kq.tbt))}ms\tPerf ${trungVi(kq.perf)}\tA11y ${trungVi(kq.a11y)}\t(LCP các lần: ${kq.lcp.map((x) => x.toFixed(2)).join(", ")})`
  );
}
