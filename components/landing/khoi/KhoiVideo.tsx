import { useTranslations } from "next-intl";
import type { KhoiVideo } from "@/lib/chien-dich/types";

interface KhoiVideoProps {
  khoi: KhoiVideo;
}

export function KhoiVideo({ khoi }: KhoiVideoProps) {
  const t = useTranslations("trang-chu.landing.video");
  const { tieu_de, mp4, webm, anh_bia, dinh_dang = "ngang" } = khoi;

  const isDoc = dinh_dang === "doc";

  return (
    <section
      aria-label={t("aria")}
      className="relative z-10 bg-white py-16 px-5 sm:px-8 md:px-16"
    >
      <div className="max-w-[1100px] mx-auto flex flex-col items-center gap-6 text-center">
        {tieu_de && (
          <h2 className="m-0 font-bold text-[32px] sm:text-[44px] text-den">
            {tieu_de}
          </h2>
        )}

        <div
          className={`relative w-full rounded-[28px] overflow-hidden bg-xam/10 shadow-lg ${
            isDoc ? "max-w-[380px] aspect-9/16" : "max-w-[960px] aspect-16/9"
          }`}
        >
          {mp4 || webm ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={anh_bia}
              className="w-full h-full object-cover"
            >
              {mp4 && <source src={mp4} type="video/mp4" />}
              {webm && <source src={webm} type="video/webm" />}
              {t("khongHoTro")}
            </video>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-hong-nhat to-bac-ha-nhat text-xam p-6">
              <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md mb-3">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="#2B2B2A"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <p className="m-0 text-[14px]">{t("dangCapNhat")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
