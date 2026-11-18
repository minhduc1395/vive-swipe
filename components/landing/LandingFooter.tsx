import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative z-10 bg-white border-t border-black/5 py-12 px-5 sm:px-8 md:px-16 text-[14px] text-xam">
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/vive-logo-black.png"
            alt="VIVE"
            className="w-16 h-auto object-contain"
          />
          <span className="text-[13px] text-xam">
            K-Beauty Experience · LL2 Union Square
          </span>
        </div>

        <nav
          aria-label="Mạng xã hội"
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-den"
        >
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Facebook: VIVE - K Beauty Experience
          </a>
          <a
            href="https://instagram.com/vive.k_beauty"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Instagram: @vive.k_beauty
          </a>
          <a
            href="https://tiktok.com/@viveuniverse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            TikTok: @viveuniverse
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/chinh-sach" className="hover:underline text-xam">
            Chính sách & Pháp lý
          </Link>
          <span>·</span>
          <span>© 2026 VIVE</span>
        </div>
      </div>
    </footer>
  );
}
