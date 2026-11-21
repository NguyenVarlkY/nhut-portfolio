import type { Metadata } from "next";
import ThemeProvider from "@/components/ui/ThemeProvider";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = { title: "Quản lý Portfolio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <ThemeProvider>
      <AdminApp />
    </ThemeProvider>
  );
}
