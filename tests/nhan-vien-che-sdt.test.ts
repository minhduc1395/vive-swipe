import { describe, expect, it } from "vitest";
import { cheSdt } from "@/lib/nhan-vien/che-sdt";
import { actionLayDanhSachDon } from "@/app/nhan-vien/actions";
import { layDanhSachDonGiuHangHomNay } from "@/lib/giu-hang/kho-giu-hang";

describe("Job #136 · che SĐT ở /nhan-vien", () => {
  it("cheSdt: số 10 chữ số giữ 4 số cuối", () => {
    expect(cheSdt("0987112112")).toBe("******2112");
  });
  it("cheSdt: bỏ khoảng trắng", () => {
    expect(cheSdt("0987 112 112")).toBe("******2112");
    expect(cheSdt(" 0912 345 678 ")).toBe("******5678");
  });
  it("cheSdt: số ngắn hơn 4 thì che hết, số đúng 4 giữ nguyên", () => {
    expect(cheSdt("123")).toBe("***");
    expect(cheSdt("1234")).toBe("1234");
    expect(cheSdt("")).toBe("");
    expect(cheSdt(null)).toBe("");
  });

  it("actionLayDanhSachDon không trả SĐT đầy đủ ở bất kỳ trường nào", async () => {
    const goc = await layDanhSachDonGiuHangHomNay();
    const sdtDayDu = goc.map((d) => d.sdt.replace(/\s+/g, "")).filter((s) => s.length > 4);
    expect(sdtDayDu.length).toBeGreaterThan(0);

    const ds = await actionLayDanhSachDon("thu:nhan_vien");
    expect(ds.length).toBe(goc.length);
    const json = JSON.stringify(ds);
    for (const so of sdtDayDu) expect(json).not.toContain(so);
    for (const d of ds) expect(d.sdt).toMatch(/^\**\d{0,4}$/);
  });
});
