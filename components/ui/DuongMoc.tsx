/** Thanh tiến tới mốc quà (giỏ, deal theo hóa đơn). */
export function DuongMoc({ tiLe, nhan, className = "" }: { tiLe: number; nhan?: string; className?: string }) {
  const p = Math.max(0, Math.min(1, tiLe));
  return (
    <div className={className}>
      <div className="h-2 rounded-full bg-hong-nhat overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)} aria-label={nhan}>
        <div className="h-full rounded-full bg-hong transition-[width] duration-300" style={{ width: `${p * 100}%` }} />
      </div>
      {nhan ? <p className="mt-1.5 text-[13px] text-xam">{nhan}</p> : null}
    </div>
  );
}
