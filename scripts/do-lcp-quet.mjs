// Đo LCP của /quet trên điện thoại 4G giả lập (W069, #128). Không thêm gói npm: dùng Playwright có sẵn.
// Cách đo: Pixel 7, mạng ~1,6 Mbps (tải 200000 byte/s), trễ 150 ms, CPU chậm 4x, đã có cờ khảo sát.
// CHROME_PATH=... để dùng Chrome có sẵn khi bản Playwright không khớp trình duyệt đã cài.
// Dùng: node scripts/do-lcp-quet.mjs <gốc-url> [số-lần=3]
import { chromium, devices } from "playwright";

const goc = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const soLan = Number(process.argv[3] ?? 3);

const trungVi = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};

const ketQua = [];
const trinhDuyet = await chromium.launch({ args: ["--no-sandbox"], executablePath: process.env.CHROME_PATH || undefined });
try {
  for (let i = 0; i < soLan; i++) {
    const ngu = await trinhDuyet.newContext({
      ...devices["Pixel 7"],
      locale: "vi-VN",
      ignoreHTTPSErrors: process.env.BO_QUA_LOI_TLS === "1", // chỉ khi đo với Supabase giả cục bộ dùng chứng chỉ tự ký
    });
    // Cờ khảo sát phải có trước khi trang chạy, nếu không /quet chuyển về /chao
    await ngu.addInitScript(() => {
      try {
        window.localStorage.setItem("vive_da_khao_sat", "true");
      } catch {}
      window.__lcp = null;
      new PerformanceObserver((list) => {
        const e = list.getEntries().at(-1);
        if (!e) return;
        window.__lcp = {
          ms: e.startTime,
          phanTu: e.element ? e.element.tagName.toLowerCase() : "?",
          url: e.url || "",
        };
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    const trang = await ngu.newPage();
    const cdp = await ngu.newCDPSession(trang);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 93750,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await trang.goto(`${goc}/quet`, { waitUntil: "load", timeout: 120000 });
    // Chờ LCP ổn định: thẻ đầu đã hiện ảnh, rồi thêm 2,5 giây
    await trang
      .waitForSelector("article img", { timeout: 30000 })
      .catch(() => {});
    await trang.waitForTimeout(2500);
    // Chốt LCP bằng tương tác đầu tiên (trình duyệt không báo thêm sau đó)
    await trang.mouse.click(5, 5).catch(() => {});
    const lcp = await trang.evaluate(() => window.__lcp);
    ketQua.push(lcp);
    console.log(
      `lần ${i + 1}: LCP ${lcp ? (lcp.ms / 1000).toFixed(2) + "s" : "không có"}\t${lcp ? `${lcp.phanTu} ${lcp.url.slice(0, 110)}` : ""}`
    );
    await ngu.close();
  }
} finally {
  await trinhDuyet.close();
}
const hopLe = ketQua.filter(Boolean).map((k) => k.ms / 1000);
if (hopLe.length === 0) {
  console.log("Không đo được LCP");
  process.exit(1);
}
const tv = trungVi(hopLe);
const pt = ketQua.filter(Boolean).at(-1);
console.log(
  `Trung vị LCP ${tv.toFixed(2)}s (các lần: ${hopLe.map((x) => x.toFixed(2)).join(", ")}) · phần tử LCP: ${pt.phanTu} ${pt.url}`
);
