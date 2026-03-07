import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "塾オタク 管理画面",
  manifest: "/manifest-admin.json",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
