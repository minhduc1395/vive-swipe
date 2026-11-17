import { AppShell } from "@/components/AppShell";
import { layDonGiuHangTheoMa } from "@/lib/giu-hang/kho-giu-hang";
import { ChiTietMaGiuHang } from "./ChiTietMaGiuHang";

export default async function TrangMaGiuHang({
  params,
}: {
  params: Promise<{ ma: string }>;
}) {
  const { ma } = await params;
  const maChuanHoa = decodeURIComponent(ma).toUpperCase();

  let don = await layDonGiuHangTheoMa(maChuanHoa);

  // Fallback demo object nếu chưa có trong DB (ví dụ mở trực tiếp VIVE-4821)
  if (!don) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");

    don = {
      id: `fallback-${maChuanHoa}`,
      ma: maChuanHoa,
      ten: "Khách trải nghiệm",
      sdt: "0901234567",
      email: "khach@email.com",
      ngayDen: `${yyyy}-${mm}-${dd}`,
      hetHan: `${yyyy}-${mm}-${dd}T21:00:00+07:00`,
      trangThai: "moi",
      tongUocTinh: 1235000,
      quaDuKien: "1 ampoule LOPOE",
      taoLuc: new Date().toISOString(),
      cacDong: [
        {
          id: "combo-pink",
          ten: "COMBO PINK PDRN",
          thuongHieu: "VIVE",
          soLuong: 1,
          giaSauUuDai: 999000,
          loai: "combo",
        },
        {
          id: "LOPOE-CF",
          ten: "Sữa rửa mặt LOPOE",
          thuongHieu: "LOPOE",
          soLuong: 1,
          giaSauUuDai: 186000,
          loai: "san_pham",
        },
        {
          id: "8809459397669",
          ten: "Mặt nạ Aloe Dermal",
          thuongHieu: "Dermal",
          soLuong: 2,
          giaSauUuDai: 50000,
          loai: "san_pham",
        },
      ],
    };
  }

  return (
    <AppShell>
      <div className="max-w-[540px] mx-auto px-4 md:px-6 py-4 md:py-8">
        <main>
          <ChiTietMaGiuHang don={don} />
        </main>
      </div>
    </AppShell>
  );
}
