import { QuanTriClient } from "./QuanTriClient";

export const dynamic = "force-dynamic";

export default function TrangQuanTri() {
  return (
    <div className="min-h-dvh bg-trang text-den flex flex-col">
      <QuanTriClient />
    </div>
  );
}
