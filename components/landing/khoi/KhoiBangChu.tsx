import type { KhoiBangChu } from "@/lib/chien-dich/types";

interface KhoiBangChuProps {
  khoi: KhoiBangChu;
}

export function KhoiBangChu({ khoi }: KhoiBangChuProps) {
  const { chu, mau_nen = "#E8D2CC" } = khoi;
  // Repeat string enough times for seamless marquee
  const repeated = `${chu} `.repeat(4);

  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden whitespace-nowrap py-4 select-none z-10"
      style={{ backgroundColor: mau_nen }}
    >
      <div className="inline-flex font-bold text-[24px] sm:text-[30px] md:text-[36px] tracking-[-0.03em] text-den animate-chay">
        <span className="pr-8">{repeated}</span>
        <span className="pr-8">{repeated}</span>
      </div>
    </div>
  );
}
