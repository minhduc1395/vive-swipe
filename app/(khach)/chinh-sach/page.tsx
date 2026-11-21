import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NutQuayLai } from "@/components/NutQuayLai";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { DOANH_NGHIEP } from "@/lib/data";

function layDiaDiemBooth(ngonNgu: string): string {
  return ngonNgu === "en" && DOANH_NGHIEP.dia_chi_booth_en
    ? DOANH_NGHIEP.dia_chi_booth_en
    : DOANH_NGHIEP.dia_diem_booth;
}

export async function generateMetadata(): Promise<Metadata> {
  const [ngonNgu, t] = await Promise.all([
    getLocale(),
    getTranslations("chinh-sach"),
  ]);
  return {
    title: `${t("tieuDe")} · ${DOANH_NGHIEP.ten_cua_hang}`,
    description: t("moTaTrang", {
      diaDiem: layDiaDiemBooth(ngonNgu),
      congTy: DOANH_NGHIEP.ten_cong_ty,
    }),
  };
}

export default async function TrangChinhSach() {
  const [ngonNgu, t] = await Promise.all([
    getLocale(),
    getTranslations("chinh-sach"),
  ]);
  const diaDiemBooth = layDiaDiemBooth(ngonNgu);
  const thieuBanEn = ngonNgu === "en" ? "1" : undefined;

  return (
    <div className="max-w-[820px] w-full mx-auto px-5 md:px-8 py-5 md:py-10 flex flex-col gap-6">
        <header className="flex flex-col items-start gap-1">
          <NutQuayLai fallback="/" />
          <h1 className="tieu-de-trang">
            {t("tieuDe")}
          </h1>
          <p className="m-0 text-[15px] text-xam leading-relaxed">
            {t("gioiThieu", { diaDiem: diaDiemBooth })}
          </p>
        </header>

        <main className="flex flex-col gap-4">
          <section
            aria-labelledby="muc-bao-mat"
            className="hien-dan rounded-[24px] bg-hong-nhat p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-bao-mat"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              {t("baoMat.tieuDe")}
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>{t("baoMat.donVi.nhan")}</strong>{" "}
                {t("baoMat.donVi.noiDung")}
              </li>
              <li>
                <strong>{t("baoMat.mucDich.nhan")}</strong>{" "}
                {t("baoMat.mucDich.noiDung")}
              </li>
              <li>
                <strong>{t("baoMat.thoiGianLuu.nhan")}</strong>{" "}
                {t("baoMat.thoiGianLuu.noiDung")}
              </li>
              <li>
                <strong>{t("baoMat.benXuLy.nhan")}</strong>{" "}
                {t("baoMat.benXuLy.noiDung")}
              </li>
              <li>
                <strong>{t("baoMat.quyen.nhan")}</strong>{" "}
                {t("baoMat.quyen.noiDung")}{" "}
                <a
                  href={`mailto:${DOANH_NGHIEP.email}`}
                  className="text-den underline"
                >
                  {DOANH_NGHIEP.email}
                </a>
                {t("baoMat.quyen.hauTo")}
              </li>
              <li>
                <strong>{t("baoMat.cookie.nhan")}</strong>{" "}
                {t("baoMat.cookie.noiDung")}
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-giu-hang"
            className="hien-dan rounded-[24px] bg-bac-ha-nhat p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-giu-hang"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              {t("giuHang.tieuDe")}
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>{t("giuHang.thanhToan.nhan")}</strong>{" "}
                {t("giuHang.thanhToan.noiDung", { diaDiem: diaDiemBooth })}
              </li>
              <li>
                <strong>{t("giuHang.gia.nhan")}</strong> {t("giuHang.gia.noiDung")}
              </li>
              <li>
                <strong>{t("giuHang.han.nhan")}</strong>{" "}
                {t("giuHang.han.noiDung", { gio: CAU_HINH_BOOTH.giuHangDenGio })}
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-doi-tra"
            className="hien-dan rounded-[24px] bg-trang border border-vien p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-doi-tra"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              {t("doiTra.tieuDe")}
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>{t("doiTra.doiTra.nhan")}</strong>{" "}
                {t("doiTra.doiTra.noiDung", {
                  cuaHang: DOANH_NGHIEP.ten_cua_hang,
                  email: DOANH_NGHIEP.email,
                })}
              </li>
              <li>
                <strong>{t("doiTra.nhanPhu.nhan")}</strong> {t("doiTra.nhanPhu.noiDung")}
              </li>
              <li>
                <strong>{t("doiTra.khuyenMai.nhan")}</strong> {t("doiTra.khuyenMai.noiDung")}
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-doanh-nghiep"
            className="hien-dan rounded-[24px] bg-trang border border-vien p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-doanh-nghiep"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              {t("doanhNghiep.tieuDe")}
            </h2>
            <dl className="m-0 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-y-2.5 gap-x-4 text-[14px] md:text-[15px] text-xam-dam">
              <dt className="font-semibold text-den">{t("doanhNghiep.ten")}</dt>
              <dd className="m-0" data-thieu-en={thieuBanEn}>
                {DOANH_NGHIEP.ten_cong_ty}
              </dd>

              <dt className="font-semibold text-den">{t("doanhNghiep.maSoThue")}</dt>
              <dd className="m-0">{DOANH_NGHIEP.ma_so_thue}</dd>

              <dt className="font-semibold text-den">{t("doanhNghiep.diaChi")}</dt>
              <dd className="m-0" data-thieu-en={thieuBanEn}>
                {DOANH_NGHIEP.dia_chi}
              </dd>

              <dt className="font-semibold text-den">{t("doanhNghiep.email")}</dt>
              <dd className="m-0">
                <a
                  href={`mailto:${DOANH_NGHIEP.email}`}
                  className="text-den underline"
                >
                  {DOANH_NGHIEP.email}
                </a>
              </dd>

              {DOANH_NGHIEP.so_dien_thoai && (
                <>
                  <dt className="font-semibold text-den">{t("doanhNghiep.soDienThoai")}</dt>
                  <dd className="m-0">{DOANH_NGHIEP.so_dien_thoai}</dd>
                </>
              )}

              <dt className="font-semibold text-den">{t("doanhNghiep.cuaHangPopup")}</dt>
              <dd className="m-0">
                {DOANH_NGHIEP.ten_cua_hang} · {diaDiemBooth} (
                {CAU_HINH_BOOTH.gioMoCua})
              </dd>

              <dt className="font-semibold text-den">{t("doanhNghiep.kenhChinhThuc")}</dt>
              <dd className="m-0">
                Facebook: VIVE · Instagram: @vive.vers
                · TikTok: @viveuniverse
              </dd>
            </dl>
          </section>

          <section
            aria-labelledby="muc-dieu-khoan"
            className="hien-dan rounded-[24px] bg-trang border border-vien p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-dieu-khoan"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              {t("dieuKhoan.tieuDe")}
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>{t("dieuKhoan.gia.nhan")}</strong>{" "}
                {t("dieuKhoan.gia.noiDung")}
              </li>
              <li>
                <strong>{t("dieuKhoan.hinhAnh.nhan")}</strong>{" "}
                {t("dieuKhoan.hinhAnh.noiDung")}
              </li>
              <li>
                <strong>{t("dieuKhoan.gioiHanDon.nhan")}</strong>{" "}
                {t("dieuKhoan.gioiHanDon.noiDung")}
              </li>
              <li>
                <strong>{t("dieuKhoan.lamDung.nhan")}</strong>{" "}
                {t("dieuKhoan.lamDung.noiDung")}
              </li>
              <li>
                <strong>{t("dieuKhoan.luatApDung.nhan")}</strong>{" "}
                {t("dieuKhoan.luatApDung.noiDung")}
              </li>
            </ul>
          </section>
        </main>
      </div>
  );
}
