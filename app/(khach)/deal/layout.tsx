import { DuLieuProvider } from "@/lib/du-lieu-context";

export default function DuLieuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DuLieuProvider>{children}</DuLieuProvider>;
}
