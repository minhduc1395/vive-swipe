import { AppShell } from "@/components/AppShell";

export default function KhachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
