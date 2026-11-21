"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NutQuayLai } from "@/components/NutQuayLai";
import {
  layTraLoiLocal,
  luuTraLoiLocal,
  danhDauBoQuaKhaoSat,
  type TraLoiCauHoi,
} from "@/lib/khao-sat";
import { dongBoTraLoi } from "@/lib/supabase/auth";
import { ghiSuKien } from "@/lib/supabase/su-kien";

interface LuaChon {
  id: string;
  label: string;
}

const DANH_SACH_LOAI_DA: LuaChon[] = [
  { id: "da-dau", label: "Da dầu" },
  { id: "da-kho", label: "Da khô" },
  { id: "da-hon-hop", label: "Da hỗn hợp" },
  { id: "da-nhay-cam", label: "Da nhạy cảm" },
  { id: "da-thuong", label: "Da thường" },
  { id: "chua-ro", label: "Chưa rõ" },
];

const DANH_SACH_MOI_QUAN_TAM: LuaChon[] = [
  { id: "mun", label: "Mụn" },
  { id: "lo-chan-long", label: "Lỗ chân lông" },
  { id: "sang-da", label: "Thâm, sáng da" },
  { id: "cap-am", label: "Cấp ẩm" },
  { id: "lam-diu", label: "Làm dịu" },
  { id: "chong-lao-hoa", label: "Chống lão hóa" },
  { id: "chong-nang", label: "Chống nắng" },
  { id: "trang-diem", label: "Trang điểm" },
  { id: "cham-soc-co-the", label: "Chăm sóc cơ thể" },
  { id: "thiet-bi", label: "Thiết bị làm đẹp" },
];

const DANH_SACH_NGAN_SACH: LuaChon[] = [
  { id: "duoi-200k", label: "Dưới 200K" },
  { id: "200k-500k", label: "200K–500K" },
  { id: "tren-500k", label: "Trên 500K" },
  { id: "khong-quan-trong", label: "Không quan trọng" },
];

export default function TrangBatDau() {
  const [buoc, setBuoc] = useState<number>(1);
  const [loaiDa, setLoaiDa] = useState<string | null>(null);
  const [vanDe, setVanDe] = useState<string[]>([]);
  const [nganSach, setNganSach] = useState<string | null>(null);
  const [canhBaoQuaSoLuong, setCanhBaoQuaSoLuong] = useState<boolean>(false);

  useEffect(() => {
    // Khôi phục câu trả lời nếu đã lưu trước đó
    const daLuu = layTraLoiLocal();
    if (daLuu) {
      /* eslint-disable react-hooks/set-state-in-effect */
      if (daLuu.loai_da) setLoaiDa(daLuu.loai_da);
      if (daLuu.van_de && Array.isArray(daLuu.van_de)) setVanDe(daLuu.van_de);
      if (daLuu.ngan_sach) setNganSach(daLuu.ngan_sach);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  const luuKetQuaHienTai = () => {
    const ketQua: TraLoiCauHoi = {
      loai_da: loaiDa,
      van_de: vanDe,
      ngan_sach: nganSach,
    };
    luuTraLoiLocal(ketQua);
    void dongBoTraLoi(ketQua);
  };

  const xuLyBoQua = () => {
    danhDauBoQuaKhaoSat();
    luuKetQuaHienTai();
    ghiSuKien("bo_qua_cau_hoi", { buoc });
  };

  const xuLyChonLoaiDa = (id: string) => {
    setLoaiDa(id);
  };

  const xuLyChonMoiQuanTam = (id: string) => {
    if (vanDe.includes(id)) {
      setVanDe(vanDe.filter((item) => item !== id));
      setCanhBaoQuaSoLuong(false);
    } else if (vanDe.length < 3) {
      setVanDe([...vanDe, id]);
      setCanhBaoQuaSoLuong(false);
    } else {
      setCanhBaoQuaSoLuong(true);
    }
  };

  const xuLyChonNganSach = (id: string) => {
    setNganSach(id);
  };

  const xuLyTiepTuc = () => {
    luuKetQuaHienTai();
    if (buoc === 1) {
      setBuoc(2);
    } else if (buoc === 2) {
      setBuoc(3);
    }
  };

  return (
    <div className="w-full max-w-[560px] mx-auto flex-1 min-h-0 flex flex-col bg-trang font-sans text-den overflow-hidden">
        {/* Header điều hướng */}
        <header className="flex items-center gap-2 pt-3 md:pt-5 px-4 pb-2 shrink-0">
          {buoc === 1 ? (
            <NutQuayLai fallback="/chao" />
          ) : (
            <NutQuayLai
              fallback="/bat-dau"
              onClick={() => setBuoc((b) => b - 1)}
            />
          )}

          {/* Thanh tiến độ 3 vạch */}
          <div
            className="flex-1 grid grid-cols-3 gap-1.5"
            role="img"
            aria-label={`Câu ${buoc} trên 3`}
          >
            <div
              className={`h-1 rounded-[4px] transition-colors ${
                buoc >= 1 ? "bg-moc" : "bg-kem"
              }`}
            />
            <div
              className={`h-1 rounded-[4px] transition-colors ${
                buoc >= 2 ? "bg-moc" : "bg-kem"
              }`}
            />
            <div
              className={`h-1 rounded-[4px] transition-colors ${
                buoc >= 3 ? "bg-moc" : "bg-kem"
              }`}
            />
          </div>

          <Link
            href="/quet"
            onClick={xuLyBoQua}
            className="text-[15px] font-medium text-den no-underline px-2 py-2.5 hover:text-den/80 cursor-pointer"
          >
            Bỏ qua
          </Link>
        </header>

        {/* Nội dung câu hỏi theo từng bước */}
        {buoc === 1 && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <main className="px-6 pt-5 pb-2 flex flex-col gap-2 shrink-0">
              <span className="text-[13px] font-semibold tracking-[1.2px] text-xam">
                CÂU 1/3
              </span>
              <h1 className="m-0 text-[30px] md:text-[36px] leading-[1.1] font-bold tracking-[-0.03em]">
                Da bạn thuộc <span className="vet-hong">loại nào?</span>
              </h1>
              <p className="m-0 text-[15px] leading-relaxed text-xam">
                Chọn loại da gần với bạn nhất để VIVE gợi ý sản phẩm phù hợp.
              </p>
            </main>

            <div className="p-6 grid grid-cols-2 gap-2.5">
              {DANH_SACH_LOAI_DA.map((item) => {
                const daChon = loaiDa === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => xuLyChonLoaiDa(item.id)}
                    aria-pressed={daChon}
                    className={`h-[52px] box-border rounded-[16px] px-4 flex items-center justify-between gap-2 text-[15px] font-medium cursor-pointer text-left transition-all ${
                      daChon
                        ? "bg-hong border-[1.5px] border-transparent text-den font-semibold"
                        : "bg-nen-phu border-[1.5px] border-transparent text-den hover:bg-kem"
                    }`}
                  >
                    <span>{item.label}</span>
                    {daChon && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2B2B2A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <footer className="mt-auto p-6 pb-8 shrink-0">
              <button
                type="button"
                onClick={xuLyTiepTuc}
                className={lopNut("chinh","lon",true)}
              >
                Tiếp tục
              </button>
            </footer>
          </div>
        )}

        {buoc === 2 && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <main className="px-6 pt-5 pb-2 flex flex-col gap-2 shrink-0">
              <span className="text-[13px] font-semibold tracking-[1.2px] text-xam">
                CÂU 2/3
              </span>
              <h1 className="m-0 text-[30px] md:text-[36px] leading-[1.1] font-bold tracking-[-0.03em]">
                Bạn quan tâm <span className="vet-hong">điều gì?</span>
              </h1>
              <p className="m-0 text-[15px] leading-relaxed text-xam">
                Chọn tối đa 3. VIVE dùng để xếp sản phẩm hợp với bạn lên trước.
              </p>
            </main>

            <div className="p-6 pb-2 grid grid-cols-2 gap-2.5">
              {DANH_SACH_MOI_QUAN_TAM.map((item) => {
                const daChon = vanDe.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => xuLyChonMoiQuanTam(item.id)}
                    aria-pressed={daChon}
                    className={`h-[52px] box-border rounded-[16px] px-4 flex items-center justify-between gap-2 text-[15px] font-medium cursor-pointer text-left transition-all ${
                      daChon
                        ? "bg-hong border-[1.5px] border-transparent text-den font-semibold"
                        : "bg-nen-phu border-[1.5px] border-transparent text-den hover:bg-kem"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {daChon && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2B2B2A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="shrink-0"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-2 text-[14px] text-xam min-h-[24px]">
              {canhBaoQuaSoLuong
                ? "Đã đủ 3 lựa chọn. Bỏ bớt một mục để đổi."
                : `Đã chọn ${vanDe.length}/3`}
            </div>

            <footer className="mt-auto p-6 pb-8 shrink-0">
              <button
                type="button"
                onClick={xuLyTiepTuc}
                className={lopNut("chinh","lon",true)}
              >
                Tiếp tục
              </button>
            </footer>
          </div>
        )}

        {buoc === 3 && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <main className="px-6 pt-5 pb-2 flex flex-col gap-2 shrink-0">
              <span className="text-[13px] font-semibold tracking-[1.2px] text-xam">
                CÂU 3/3
              </span>
              <h1 className="m-0 text-[30px] md:text-[36px] leading-[1.1] font-bold tracking-[-0.03em]">
                Mỗi món bạn thường <span className="vet-hong">chi khoảng?</span>
              </h1>
              <p className="m-0 text-[15px] leading-relaxed text-xam">
                Khoảng giá bạn thấy thoải mái nhất khi mua một món chăm sóc da.
              </p>
            </main>

            <div className="p-6 grid grid-cols-2 gap-2.5">
              {DANH_SACH_NGAN_SACH.map((item) => {
                const daChon = nganSach === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => xuLyChonNganSach(item.id)}
                    aria-pressed={daChon}
                    className={`h-[52px] box-border rounded-[16px] px-4 flex items-center justify-between gap-2 text-[15px] font-medium cursor-pointer text-left transition-all ${
                      daChon
                        ? "bg-hong border-[1.5px] border-transparent text-den font-semibold"
                        : "bg-nen-phu border-[1.5px] border-transparent text-den hover:bg-kem"
                    }`}
                  >
                    <span>{item.label}</span>
                    {daChon && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2B2B2A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <footer className="mt-auto p-6 pb-8 shrink-0">
              <Link
                href="/quet"
                onClick={() => {
                  luuKetQuaHienTai();
                  ghiSuKien("xong_cau_hoi", {
                    loai_da: loaiDa,
                    van_de: vanDe,
                    ngan_sach: nganSach,
                  });
                }}
                className={lopNut("chinh","lon",true)}
              >
                Bắt đầu quẹt
              </Link>
            </footer>
          </div>
        )}
      </div>
  );
}
