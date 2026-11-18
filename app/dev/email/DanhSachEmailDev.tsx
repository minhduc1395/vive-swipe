"use client";

import { useState } from "react";
import type { EmailDaGui } from "@/lib/email/store";

interface Props {
  emails: EmailDaGui[];
  onXoaHet?: () => void;
}

export function DanhSachEmailDev({ emails }: Props) {
  const [dangChonId, setDangChonId] = useState<string | null>(
    emails.length > 0 ? emails[0].id : null
  );

  const emailDangChon = emails.find((e) => e.id === dangChonId);

  if (emails.length === 0) {
    return (
      <div className="rounded-[22px] bg-hong-nhat p-6 text-center">
        <p className="m-0 text-[15px] font-semibold text-den">
          Chưa có email nào được gửi trong phiên chạy này.
        </p>
        <p className="mt-2 mb-0 text-[13px] text-xam">
          Thực hiện một lượt giữ hàng tại <code className="font-mono">/giu-hang</code> kèm địa chỉ email để xem email xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Cột danh sách email */}
      <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-2">
        <div className="text-[13px] text-xam font-medium px-1">
          Đã ghi nhận {emails.length} email:
        </div>
        {emails.map((e) => {
          const active = e.id === dangChonId;
          const thoiGian = new Date(e.taoLuc).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setDangChonId(e.id)}
              className={`w-full text-left p-3.5 rounded-[16px] transition-colors border ${
                active
                  ? "bg-den text-trang border-den shadow-sm"
                  : "bg-trang text-den border-[#E8D2CC] hover:bg-hong-nhat/50"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span
                  className={`font-semibold ${
                    active ? "text-[#CFE3D5]" : "text-xam"
                  }`}
                >
                  {e.maGiuHang ? `[${e.maGiuHang}]` : e.loai}
                </span>
                <span className={active ? "text-trang/70" : "text-xam"}>
                  {thoiGian}
                </span>
              </div>
              <div className="font-semibold text-[14px] line-clamp-1">
                {e.subject}
              </div>
              <div
                className={`text-[12px] truncate ${
                  active ? "text-trang/80" : "text-xam"
                }`}
              >
                Tới: {e.to}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cột xem trước nội dung email */}
      {emailDangChon && (
        <div className="flex-1 w-full bg-trang rounded-[20px] border border-[#E8D2CC] overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-[#F7EEEB] bg-[#FAFAFA] flex flex-col gap-1">
            <div className="text-[12px] text-xam">
              <strong>Tới:</strong> {emailDangChon.to} &nbsp;·&nbsp;{" "}
              <strong>Người gửi:</strong> {emailDangChon.from}
            </div>
            <div className="text-[16px] font-bold text-den">
              {emailDangChon.subject}
            </div>
          </div>
          <div className="p-4">
            <div
              className="email-preview-content border border-[#F7EEEB] rounded-[16px] overflow-hidden bg-hong-nhat p-2"
              dangerouslySetInnerHTML={{ __html: emailDangChon.html }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
