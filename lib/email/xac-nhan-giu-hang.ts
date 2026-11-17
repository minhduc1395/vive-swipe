import { themEmailDev } from "./store";
import { dinhDangTien, dinhDangTienGio } from "@/lib/dinh-dang";

export interface ThongTinEmailGiuHang {
  to: string;
  ten: string;
  ma: string;
  hanGiuText: string;
  tongTien: number;
  quaDuKien: string | null;
  diaChi: string;
  cacDong: Array<{
    ten: string;
    so_luong: number;
    gia_sau_uu_dai: number;
  }>;
}

export function taoHtmlEmailGiuHang(thongTin: ThongTinEmailGiuHang): {
  html: string;
  text: string;
  subject: string;
} {
  const { to, ten, ma, hanGiuText, tongTien, quaDuKien, diaChi, cacDong } =
    thongTin;

  const subject = `[VIVE] Xác nhận giữ hàng ${ma} tại booth LL2 Union Square`;

  const dongItemsHtml = cacDong
    .map(
      (d) => `
      <tr style="border-bottom: 1px solid #F7EEEB;">
        <td style="padding: 10px 0; font-size: 14px; color: #2B2B2A;">
          ${d.ten} <span style="color: #737373;">× ${d.so_luong}</span>
        </td>
        <td style="padding: 10px 0; font-size: 14px; text-align: right; font-weight: 600; color: #2B2B2A;">
          ${dinhDangTien(d.gia_sau_uu_dai)}
        </td>
      </tr>`
    )
    .join("");

  const dongItemsText = cacDong
    .map((d) => `- ${d.ten} × ${d.so_luong}: ${dinhDangTien(d.gia_sau_uu_dai)}`)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F7EEEB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B2B2A;">
  <div style="max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 32px 24px; box-sizing: border-box;">
    
    <div style="text-align: center; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #2B2B2A; letter-spacing: 1px;">VIVE | K-Beauty Experience</h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #737373;">Mỹ phẩm nội địa Hàn tại TP. Hồ Chí Minh</p>
    </div>

    <div style="background-color: #F7EEEB; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 12px; font-weight: 600; letter-spacing: 1.5px; color: #737373; text-transform: uppercase;">MÃ GIỮ HÀNG</span>
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 2px; color: #2B2B2A; margin: 4px 0 8px 0;">${ma}</div>
      <div style="display: inline-block; padding: 6px 14px; background: #EAF3ED; border-radius: 999px; font-size: 13px; font-weight: 600; color: #2B2B2A;">
        ${hanGiuText}
      </div>
    </div>

    <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
      Chào <strong>${ten}</strong>,<br>
      VIVE đã nhận yêu cầu giữ hàng của bạn tại booth. Hãy đưa mã <strong>${ma}</strong> cho nhân viên tại quầy khi đến lấy nhé.
    </p>

    <div style="border-top: 2px solid #F7EEEB; padding-top: 16px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700;">Danh sách món giữ</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${dongItemsHtml}
        <tr>
          <td style="padding: 12px 0 6px 0; font-size: 15px; font-weight: 700;">Tổng ước tính</td>
          <td style="padding: 12px 0 6px 0; font-size: 16px; text-align: right; font-weight: 700;">${dinhDangTienGio(tongTien)}</td>
        </tr>
        ${
          quaDuKien
            ? `<tr>
                <td style="padding: 4px 0; font-size: 13px; color: #5C5C5B;">Quà dự kiến</td>
                <td style="padding: 4px 0; font-size: 13px; text-align: right; font-weight: 600; color: #2B2B2A;">${quaDuKien}</td>
              </tr>`
            : ""
        }
      </table>
    </div>

    <div style="background-color: #FAFAFA; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 13px; color: #5C5C5B; line-height: 1.45;">
      <p style="margin: 0 0 6px 0;">
        📍 <strong>Địa chỉ booth:</strong> ${diaChi}
      </p>
      <p style="margin: 0;">
        ℹ️ <em>Giá và quà là ước tính. Nhân viên xác nhận khi thanh toán tại booth. Quà số lượng có hạn.</em>
      </p>
    </div>

    <div style="border-top: 1px solid #F7EEEB; padding-top: 16px; text-align: center; font-size: 12px; color: #737373;">
      Email gửi tới ${to}. Cảm ơn bạn đã trải nghiệm cùng VIVE!
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
VIVE | K-Beauty Experience
Xác nhận giữ hàng tại booth

Chào ${ten},
Mã giữ hàng của bạn là: ${ma}
Hạn giữ: ${hanGiuText}
Địa chỉ: ${diaChi}

Danh sách món:
${dongItemsText}

Tổng ước tính: ${dinhDangTienGio(tongTien)}
${quaDuKien ? `Quà dự kiến: ${quaDuKien}\n` : ""}
Lưu ý: Giá và quà là ước tính. Nhân viên xác nhận khi thanh toán tại booth. Quà số lượng có hạn.
  `.trim();

  return { html, text, subject };
}

/**
 * Gửi email xác nhận giữ hàng.
 * Khi ở development hoặc RESEND_API_KEY chưa cấu hình, tự động lưu vào bộ nhớ dev (/dev/email).
 */
export async function guiEmailXacNhanGiuHang(
  thongTin: ThongTinEmailGiuHang
): Promise<{ ok: boolean; dev?: boolean; error?: string }> {
  const { html, text, subject } = taoHtmlEmailGiuHang(thongTin);
  const from = process.env.EMAIL_FROM || "VIVE <deal@ten-mien-cua-vive>";
  const apiKey = process.env.RESEND_API_KEY;

  if (process.env.NODE_ENV === "development" || !apiKey) {
    themEmailDev({
      to: thongTin.to,
      from,
      subject,
      html,
      text,
      maGiuHang: thongTin.ma,
      loai: "xac_nhan_giu_hang",
    });
    return { ok: true, dev: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: thongTin.to,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.error("[Email] Lỗi gửi Resend:", errJson);
      // Fallback dev store nếu gửi thật lỗi
      themEmailDev({
        to: thongTin.to,
        from,
        subject,
        html,
        text,
        maGiuHang: thongTin.ma,
        loai: "xac_nhan_giu_hang",
      });
      return { ok: false, error: JSON.stringify(errJson) };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Email] Ngoại lệ gửi email:", err);
    return { ok: false, error: String(err) };
  }
}
